# -*- coding: utf-8 -*-
"""
Análise exploratória do ficheiro pastelaria.xlsx (folhas: produtos, ingredientes, vendas).

Uso:
    python analise.py "C:\\caminho\\pastelaria.xlsx" <pasta_de_saida>

Gera em <pasta_de_saida>:
    dados/*.csv        tabelas finais (UTF-8 com BOM, abrem bem no Excel)
    graficos/*.png     gráficos
    resumo.json        números-chave
    _tabelas.md        todas as tabelas em markdown (base do relatório)
"""

import sys
import os
import json
import numpy as np
import pandas as pd
from scipy import stats
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

SRC = sys.argv[1] if len(sys.argv) > 1 else "pastelaria.xlsx"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(__file__))
DADOS = os.path.join(OUT, "dados")
GRAF = os.path.join(OUT, "graficos")
os.makedirs(DADOS, exist_ok=True)
os.makedirs(GRAF, exist_ok=True)

md = []
csvs = {}


def add_md(titulo, df):
    md.append(f"\n#### {titulo}\n")
    md.append(df.to_markdown(index=True) + "\n")


def guardar(nome, df):
    df.to_csv(os.path.join(DADOS, nome + ".csv"), index=True, encoding="utf-8-sig")
    csvs[nome] = df
    return df


def eur(x):
    s = f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"{s} EUR"


def num(x, dec=0):
    return f"{x:,.{dec}f}".replace(",", "X").replace(".", ",").replace("X", ".")


def pct(x, dec=1):
    return f"{num(x, dec)}%"


# ---------------------------------------------------------------- carregar
prod = pd.read_excel(SRC, sheet_name="produtos")
ing = pd.read_excel(SRC, sheet_name="ingredientes")
ven = pd.read_excel(SRC, sheet_name="vendas")

ven["receita"] = ven["unit_price"] * ven["quantity"]
ven["data"] = pd.to_datetime(ven["date"])
ven["ano"] = ven["data"].dt.year
ven["mes"] = ven["data"].dt.month
ven["dow"] = ven["data"].dt.dayofweek
ven["fim_semana"] = ven["dow"] >= 5
ven["ym"] = ven["data"].dt.to_period("M").astype(str)

DIAS_PT = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
MESES_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

v = ven.merge(prod[["id", "name", "category", "cost_price"]], left_on="product_id",
              right_on="id", how="left", suffixes=("", "_produto"))
v["lucro"] = (v["unit_price"] - v["cost_price"]) * v["quantity"]

DIAS_TOTAL = (ven["data"].max() - ven["data"].min()).days + 1
DIAS_COM_VENDA = ven["data"].nunique()

# ---------------------------------------------------------------- 1 integridade
precos = ven[["product_id", "unit_price"]].drop_duplicates().merge(
    prod[["id", "unit_price"]], left_on="product_id", right_on="id", suffixes=("_venda", "_produto"))
n_pdif = int(((precos["unit_price_venda"] - precos["unit_price_produto"]).abs() > 1e-9).sum())
dias_em_falta = pd.date_range(ven["data"].min(), ven["data"].max(), freq="D").difference(
    pd.DatetimeIndex(ven["data"].unique()))

integ = pd.DataFrame([
    ("Linhas na folha vendas", num(len(ven))),
    ("Id de venda duplicado", num(int(ven["id"].duplicated().sum()))),
    ("Células nulas (todas as folhas de vendas)", num(int(ven.isnull().sum().sum()))),
    ("product_id sem correspondência em produtos", num(len(set(ven["product_id"]) - set(prod["id"])))),
    ("Produtos sem nenhuma venda", num(len(set(prod["id"]) - set(ven["product_id"])))),
    ("Preços de venda divergentes da folha produtos", num(n_pdif)),
    ("Data mínima", str(ven["data"].min().date())),
    ("Data máxima", str(ven["data"].max().date())),
    ("Dias no intervalo", num(DIAS_TOTAL)),
    ("Dias com vendas", num(DIAS_COM_VENDA)),
    ("Dias em falta no intervalo", num(len(dias_em_falta))),
    ("Horas distintas", f'{ven["hour"].min()}h–{ven["hour"].max()}h'),
    ("Quantidade por linha (min/max)", f'{ven["quantity"].min()} / {ven["quantity"].max()}'),
    ("Meios de pagamento", ", ".join(sorted(ven["payment_method"].unique()))),
    ("Receita total", eur(ven["receita"].sum())),
    ("Custo de produção total", eur(v["cost_price"].mul(v["quantity"]).sum())),
    ("Lucro bruto total", eur(v["lucro"].sum())),
], columns=["verificação", "resultado"]).set_index("verificação")
guardar("01_integridade", integ)

# ---------------------------------------------------------------- 2 rentabilidade
agg = v.groupby(["product_id", "name", "category"], as_index=False).agg(
    unidades=("quantity", "sum"), receita=("receita", "sum"))
agg["custo"] = v.assign(c=v["cost_price"] * v["quantity"]).groupby("product_id")["c"].sum().values
agg["lucro"] = agg["receita"] - agg["custo"]
agg["margem_pct"] = (agg["lucro"] / agg["receita"] * 100).round(1)
agg["part_receita"] = (agg["receita"] / agg["receita"].sum() * 100).round(1)
agg["part_lucro"] = (agg["lucro"] / agg["lucro"].sum() * 100).round(1)
agg["lucro_unit"] = (agg["lucro"] / agg["unidades"]).round(2)
agg["preco_medio"] = (agg["receita"] / agg["unidades"]).round(2)
agg["custo_unit"] = (agg["custo"] / agg["unidades"]).round(3)
agg = agg.sort_values("lucro", ascending=False).reset_index(drop=True)

rent = agg[["product_id", "name", "category", "unidades", "preco_medio", "custo_unit",
            "receita", "custo", "lucro", "lucro_unit", "margem_pct",
            "part_receita", "part_lucro"]].copy()
rent.columns = ["id", "produto", "categoria", "unidades", "preço_médio", "custo_unitário",
                "receita", "custo_produção", "lucro", "lucro_unitário", "margem_%",
                "part_receita_%", "part_lucro_%"]
rent = rent.set_index("id").round(2)
guardar("02_rentabilidade_produto", rent)
add_md("Rentabilidade por produto (ordenado por lucro)", rent)

cat = v.groupby("category").agg(unidades=("quantity", "sum"), receita=("receita", "sum"),
                                lucro=("lucro", "sum"), linhas=("id", "size"))
cat["custo"] = cat["receita"] - cat["lucro"]
cat["margem_pct"] = (cat["lucro"] / cat["receita"] * 100).round(1)
cat["part_receita"] = (cat["receita"] / cat["receita"].sum() * 100).round(1)
cat["part_lucro"] = (cat["lucro"] / cat["lucro"].sum() * 100).round(1)
cat = cat.sort_values("lucro", ascending=False)
cat.columns = ["unidades", "receita", "lucro", "linhas", "custo_produção",
               "margem_%", "part_receita_%", "part_lucro_%"]
cat.index.name = "categoria"
cat = cat.round(2)
guardar("03_categorias", cat)
add_md("Rentabilidade por categoria", cat)

rent_sorted = agg.sort_values("lucro", ascending=False)
rent_sorted["cum_lucro_pct"] = (rent_sorted["lucro"].cumsum() / rent_sorted["lucro"].sum() * 100).round(1)
n80 = int((rent_sorted["cum_lucro_pct"] < 80).sum()) + 1

# ---------------------------------------------------------------- 3 tops
por_prod = agg.sort_values("receita", ascending=False)
top_qtd = agg.sort_values("unidades", ascending=False)
top_lucro = agg.sort_values("lucro", ascending=False)

top_rec = por_prod.head(10)[["name", "category", "unidades", "receita", "lucro", "margem_pct"]]
top_rec = top_rec.set_index("name")
top_rec.columns = ["categoria", "unidades", "receita", "lucro", "margem_%"]
top_rec = top_rec.round(2)
top_rec.index.name = "produto"
add_md("Top 10 por receita", top_rec)

top_q = top_qtd.head(10)[["name", "category", "unidades", "receita", "lucro", "margem_pct"]]
top_q = top_q.set_index("name")
top_q.columns = ["categoria", "unidades", "receita", "lucro", "margem_%"]
top_q = top_q.round(2)
top_q.index.name = "produto"
add_md("Top 10 por quantidade", top_q)

top_l = top_lucro.head(10)[["name", "category", "unidades", "receita", "lucro",
                            "lucro_unit", "margem_pct"]]
top_l = top_l.set_index("name")
top_l.columns = ["categoria", "unidades", "receita", "lucro", "lucro_unitário", "margem_%"]
top_l = top_l.round(2)
top_l.index.name = "produto"
add_md("Top 10 por lucro", top_l)

# ---------------------------------------------------------------- 4 tempo
diario = ven.groupby("data").agg(receita=("receita", "sum"), unidades=("quantity", "sum"),
                                 linhas=("id", "size")).reset_index()
diario = pd.DataFrame({"data": pd.date_range(ven["data"].min(), ven["data"].max(), freq="D")}).merge(
    diario, on="data", how="left").fillna(0)
diario["dow"] = diario["data"].dt.dayofweek
diario["fim_semana"] = diario["dow"] >= 5
diario["ticket_medio"] = (diario["receita"] / diario["linhas"].replace(0, np.nan)).round(2)
guardar("04_serie_diaria", diario.set_index("data"))

dow = ven.groupby("dow").agg(receita=("receita", "sum"), unidades=("quantity", "sum"),
                             linhas=("id", "size")).reindex(range(7), fill_value=0)
dow["n_dias"] = diario.groupby("dow").size().reindex(range(7))
dow["receita_dia"] = (dow["receita"] / dow["n_dias"]).round(2)
dow["unid_dia"] = (dow["unidades"] / dow["n_dias"]).round(2)
dow["linhas_dia"] = (dow["linhas"] / dow["n_dias"]).round(2)
dow["part_receita_pct"] = (dow["receita"] / dow["receita"].sum() * 100).round(1)
dow.index = [DIAS_PT[i] for i in dow.index]
dow = dow[["n_dias", "receita", "unidades", "linhas", "receita_dia", "unid_dia",
           "linhas_dia", "part_receita_pct"]]
dow.columns = ["nº_dias", "receita", "unidades", "linhas", "receita/dia", "unid/dia",
               "linhas/dia", "part_receita_%"]
dow.index.name = "dia_da_semana"
guardar("05_dia_semana", dow.round(2))
add_md("Dia da semana (365 dias)", dow.round(2))

fds = ven.groupby("fim_semana").agg(receita=("receita", "sum"), unidades=("quantity", "sum"),
                                    linhas=("id", "size"))
fds["n_dias"] = diario.groupby("fim_semana").size()
fds["receita_dia"] = (fds["receita"] / fds["n_dias"]).round(2)
fds["unid_dia"] = (fds["unidades"] / fds["n_dias"]).round(2)
fds["linhas_dia"] = (fds["linhas"] / fds["n_dias"]).round(2)
fds.index = ["Dia de semana (seg–sex)", "Fim de semana (sáb–dom)"]
fds.columns = ["receita", "unidades", "linhas", "nº_dias", "receita/dia", "unid/dia", "linhas/dia"]
fds.index.name = "segmento"
guardar("06_semana_vs_fim_semana", fds)
add_md("Dia de semana vs fim de semana", fds.round(2))

a = diario.loc[~diario["fim_semana"], "receita"]
b = diario.loc[diario["fim_semana"], "receita"]
mw = stats.mannwhitneyu(a, b)

horas = ven.groupby("hour").agg(receita=("receita", "sum"), unidades=("quantity", "sum"),
                                linhas=("id", "size")).reindex(range(7, 20), fill_value=0)
horas["part_receita_pct"] = (horas["receita"] / horas["receita"].sum() * 100).round(1)
horas.columns = ["receita", "unidades", "linhas", "part_receita_%"]
horas.index.name = "hora"
guardar("07_horas", horas)
add_md("Hora do dia (7h–19h)", horas.round(2))

top_dias = diario.sort_values("receita", ascending=False).head(12).copy()
top_dias["dia_da_semana"] = [DIAS_PT[d] for d in top_dias["dow"]]
top_dias["data"] = top_dias["data"].dt.strftime("%Y-%m-%d")
top_dias = top_dias[["data", "dia_da_semana", "receita", "unidades", "linhas", "ticket_medio"]]
top_dias.columns = ["data", "dia_da_semana", "receita", "unidades", "linhas", "ticket_médio"]
top_dias = top_dias.set_index("data")
guardar("08_top_dias", top_dias.round(2))
add_md("Dias com mais receita", top_dias.round(2))

hm = ven.pivot_table(index="dow", columns="hour", values="receita", aggfunc="sum").reindex(
    index=range(7), columns=range(7, 20), fill_value=0)
hm.index = [DIAS_PT[i] for i in hm.index]
hm.index.name = "dia_da_semana"
guardar("09_heatmap_dia_hora", hm)
md.append("\n#### Receita por dia da semana × hora (EUR)\n")
md.append(hm.round(0).to_markdown() + "\n")

# ---------------------------------------------------------------- 5 agregados
mensal = ven.groupby(["ano", "mes"]).agg(receita=("receita", "sum"), unidades=("quantity", "sum"),
                                         linhas=("id", "size")).reset_index()
mensal["dias"] = [diario[(diario["data"].dt.year == r.ano) & (diario["data"].dt.month == r.mes)].shape[0]
                  for r in mensal.itertuples()]
mensal["receita_dia"] = (mensal["receita"] / mensal["dias"]).round(2)
mensal["unid_dia"] = (mensal["unidades"] / mensal["dias"]).round(2)
mensal["ticket_medio"] = (mensal["receita"] / mensal["linhas"]).round(2)
mensal["mes_nome"] = [MESES_PT[m - 1] for m in mensal["mes"]]
mensal_t = mensal[["ano", "mes_nome", "dias", "linhas", "unidades", "receita",
                   "receita_dia", "unid_dia", "ticket_medio"]].copy()
mensal_t["mês"] = [f"{a}-{m:02d} ({n})" for a, m, n in
                   zip(mensal["ano"], mensal["mes"], mensal["mes_nome"])]
mensal_t = mensal_t.rename(columns={"receita_dia": "receita/dia", "unid_dia": "unid/dia",
                                    "ticket_medio": "ticket_médio", "mes_nome": "mês_nome"})
mensal_disp = mensal_t.set_index("mês")[["dias", "linhas", "unidades", "receita",
                                         "receita/dia", "unid/dia", "ticket_médio"]]
mensal_disp.index.name = "mês"
guardar("10_mensal", mensal_disp.round(2))
add_md("Total por mês", mensal_disp.round(2))

anual = ven.groupby("ano").agg(receita=("receita", "sum"), unidades=("quantity", "sum"),
                               linhas=("id", "size"))
anual["dias"] = diario.groupby(diario["data"].dt.year).size()
anual["receita_dia"] = (anual["receita"] / anual["dias"]).round(2)
anual["unid_dia"] = (anual["unidades"] / anual["dias"]).round(2)
anual["ticket_medio"] = (anual["receita"] / anual["linhas"]).round(2)
anual["preco_medio_unid"] = (anual["receita"] / anual["unidades"]).round(3)
anual_t = anual[["dias", "linhas", "unidades", "receita", "receita_dia", "unid_dia",
                 "ticket_medio", "preco_medio_unid"]]
anual_t.columns = ["dias", "linhas", "unidades", "receita", "receita/dia", "unid/dia",
                   "ticket_médio", "preço_médio_unid"]
anual_t.index.name = "ano"
guardar("11_anual", anual_t.round(2))
add_md("Total por ano", anual_t.round(2))

# 2026 vs 2025
comp = anual_t.copy()
comp["var_receita_%"] = np.nan
comp["var_unidades_%"] = np.nan
comp["var_receita/dia_%"] = np.nan
comp.loc[2026, "var_receita_%"] = round((comp.loc[2026, "receita"] / comp.loc[2025, "receita"] - 1) * 100, 1)
comp.loc[2026, "var_unidades_%"] = round((comp.loc[2026, "unidades"] / comp.loc[2025, "unidades"] - 1) * 100, 1)
comp.loc[2026, "var_receita/dia_%"] = round(
    (comp.loc[2026, "receita/dia"] / comp.loc[2025, "receita/dia"] - 1) * 100, 1)
guardar("12_comparacao_anos", comp)
add_md("Comparação bruta entre anos", comp.round(2))

dow_ano = ven.pivot_table(index="dow", columns="ano", values="receita", aggfunc="sum").reindex(range(7))
dias_dow_ano = diario.pivot_table(index="dow", columns=diario["data"].dt.year, values="receita",
                                  aggfunc="size")
dow_ano_media = (dow_ano / dias_dow_ano).round(2)
dow_ano_media["var_%"] = ((dow_ano_media[2026] / dow_ano_media[2025] - 1) * 100).round(1)
dow_ano_media.index = [DIAS_PT[i] for i in dow_ano_media.index]
dow_ano_media.index.name = "dia_da_semana"
dow_ano_media.columns = ["2025 (EUR/dia)", "2026 (EUR/dia)", "var_%"]
guardar("13_dow_por_ano", dow_ano_media)
md.append("\n#### Receita média por dia da semana, por ano\n")
md.append(dow_ano_media.round(2).to_markdown() + "\n")

# 2026 meses vs baseline 2025
base = anual_t.loc[2025, "receita/dia"]
m26 = mensal_t[mensal_t["ano"] == 2026].set_index("mês_nome").drop(columns=["ano", "mês"])
m26.index.name = "mês"
m26["vs_base_2025_%"] = ((m26["receita/dia"] / base - 1) * 100).round(1)
m26 = m26[["dias", "linhas", "unidades", "receita", "receita/dia", "unid/dia",
           "ticket_médio", "vs_base_2025_%"]]
guardar("14_2026_vs_base_2025", m26)
add_md("Meses de 2026 vs receita/dia média de 2025", m26.round(2))

d26 = diario[diario["data"].dt.year == 2026].reset_index(drop=True)
lr = stats.linregress(d26.index.values, d26["receita"].values)

# ---------------------------------------------------------------- 6 pagamentos
pg = ven.groupby("payment_method").agg(linhas=("id", "size"), unidades=("quantity", "sum"),
                                       receita=("receita", "sum")).sort_values("receita", ascending=False)
pg["part_receita_%"] = (pg["receita"] / pg["receita"].sum() * 100).round(1)
pg["part_linhas_%"] = (pg["linhas"] / pg["linhas"].sum() * 100).round(1)
pg["ticket_médio_linha"] = (pg["receita"] / pg["linhas"]).round(2)
pg["unid_por_linha"] = (pg["unidades"] / pg["linhas"]).round(2)
pg.index.name = "meio_de_pagamento"
guardar("15_pagamentos", pg)
add_md("Meios de pagamento (global)", pg.round(2))

pgm = ven.pivot_table(index="ym", columns="payment_method", values="receita", aggfunc="sum").fillna(0)
pgm_share = (pgm.div(pgm.sum(axis=1), axis=0) * 100).round(1)
pgm_share.index.name = "mês"
guardar("16_pagamentos_mensal_share", pgm_share)
add_md("Share mensal da receita por meio de pagamento (%)", pgm_share)

tend = []
for c in pgm_share.columns:
    lr_m = stats.linregress(range(len(pgm_share)), pgm_share[c].values)
    tend.append((c, round(lr_m.slope, 3), round(lr_m.rvalue ** 2, 3), round(lr_m.pvalue, 4)))
tend = pd.DataFrame(tend, columns=["meio_de_pagamento", "slope_pp/mês", "r²", "p_value"]).set_index(
    "meio_de_pagamento")
guardar("17_tendencia_pagamentos", tend)
add_md("Tendência da share mensal (regressão linear sobre 12 meses)", tend)

ct = pd.crosstab(ven["ym"], ven["payment_method"])
chi2, pchi, dof, _ = stats.chi2_contingency(ct)
grupos = [g["receita"].values for _, g in ven.groupby("payment_method")]
kw = stats.kruskal(*grupos)

pgd = ven.pivot_table(index="dow", columns="payment_method", values="receita", aggfunc="sum").fillna(0)
pgd_share = (pgd.div(pgd.sum(axis=1), axis=0) * 100).round(1)
pgd_share.index = [DIAS_PT[i] for i in pgd_share.index]
pgd_share.index.name = "dia_da_semana"
guardar("18_pagamentos_dia_semana", pgd_share)
md.append("\n#### Share por dia da semana (%)\n")
md.append(pgd_share.to_markdown() + "\n")

# ---------------------------------------------------------------- 7 produtos x ingredientes
cols_p = set(prod.columns)
cols_i = set(ing.columns)
comuns = sorted(cols_p & cols_i)
esp = prod[["id", "name", "category"]].merge(ing[["id", "name"]], on="id",
                                             suffixes=("_produto", "_ingrediente"))
esp_t = esp.head(8)[["name_produto", "category", "name_ingrediente"]].set_index("name_produto")
esp_t.index.name = "produto"
esp_t.columns = ["categoria", "ingrediente (join por id)"]
add_md("Join por id (espúrio: ids independentes)", esp_t)

forn = ing.assign(valor=ing["unit_cost"] * ing["stock"]).groupby("supplier").agg(
    artigos=("id", "size"), valor_stock=("valor", "sum"),
    abaixo_min=("stock", lambda s: 0))
forn["abaixo_min"] = ing.assign(baixo=ing["stock"] < ing["min_stock"]).groupby("supplier")["baixo"].sum()
forn = forn.sort_values("valor_stock", ascending=False).round(2)
forn.index.name = "fornecedor"
forn.columns = ["artigos", "valor_stock", "artigos_abaixo_min"]
guardar("19_ingredientes_fornecedor", forn)
add_md("Ingredientes: valor de stock por fornecedor", forn)

ing2 = ing.copy()
ing2["abaixo_min"] = ing2["stock"] < ing2["min_stock"]
ing2["valor_stock"] = (ing2["unit_cost"] * ing2["stock"]).round(2)
ing2["cobertura_%"] = (ing2["stock"] / ing2["min_stock"].replace(0, np.nan) * 100).round(0)
alerta = ing2[ing2["abaixo_min"]][["name", "unit", "stock", "min_stock", "cobertura_%",
                                   "valor_stock", "supplier"]]
alerta = alerta.set_index("name")
alerta.columns = ["unidade", "stock", "stock_mínimo", "cobertura_%", "valor_stock", "fornecedor"]
alerta.index.name = "ingrediente"
guardar("20_ingredientes_stock", ing2.set_index("id"))
add_md("Ingredientes abaixo do stock mínimo", alerta.round(2))

vendidos = agg[["product_id", "name", "unidades"]].merge(prod[["id", "stock", "min_stock"]],
                                                         left_on="product_id", right_on="id")
vendidos["vendidos_365d"] = vendidos["unidades"]
vendidos["stock_atual"] = vendidos["stock"]
vendidos["vendidos/stock"] = (vendidos["unidades"] / vendidos["stock_atual"]).round(1)
vstock = vendidos[["name", "vendidos_365d", "stock_atual", "min_stock", "vendidos/stock"]]
vstock = vstock.set_index("name")
vstock.columns = ["vendidos_365d", "stock_atual", "stock_mínimo", "vendidos/stock"]
vstock.index.name = "produto"
guardar("21_vendidos_vs_stock", vstock)

sem = v.copy()
sem["semana"] = sem["data"].dt.to_period("W-MON").astype(str)
sem_p = sem.pivot_table(index="semana", columns="name", values="quantity", aggfunc="sum").fillna(0)
sem_share = sem_p.div(sem_p.sum(axis=1), axis=0)
corr = sem_share.corr(method="spearman")
guardar("22_correlacao_produtos", corr.round(3))

pares = (corr.where(np.triu(np.ones(corr.shape), 1).astype(bool)).stack()
         .rename_axis(["produto_a", "produto_b"]).reset_index(name="rho"))
pares = pares.dropna().sort_values("rho", ascending=False).reset_index(drop=True)
n_sem = len(sem_p)
r_crit = 1.96 / np.sqrt(n_sem - 3)


def pares_tabela(df):
    t = df.copy()
    t["par"] = t["produto_a"] + " + " + t["produto_b"]
    t["significativo (5%)"] = np.where(t["rho"].abs() > r_crit, "sim", "não")
    t = t[["par", "rho", "significativo (5%)"]].set_index("par")
    return t.round(3)


pares_top = pares_tabela(pares.head(10))
pares_bot = pares_tabela(pares.tail(10).iloc[::-1])
guardar("23_pares_correlacao", pares.set_index(["produto_a", "produto_b"]))
add_md(f"Pares mais correlacionados ({n_sem} semanas, rho de Spearman; |rho| crítico = {r_crit:.3f})",
       pares_top)
add_md(f"Pares menos correlacionados ({n_sem} semanas)", pares_bot)

# estatísticas da série diária
ds = diario["receita"]
diario_stats = pd.DataFrame([
    ("dias", num(len(ds))),
    ("receita total", eur(ds.sum())),
    ("média por dia", eur(ds.mean())),
    ("mediana", eur(ds.median())),
    ("desvio padrão", eur(ds.std())),
    ("mínimo", f"{eur(ds.min())} ({diario.loc[ds.idxmin(), 'data'].date()})"),
    ("máximo", f"{eur(ds.max())} ({diario.loc[ds.idxmax(), 'data'].date()})"),
    ("percentil 25", eur(ds.quantile(0.25))),
    ("percentil 75", eur(ds.quantile(0.75))),
    ("dias sem vendas", num(int((ds == 0).sum()))),
], columns=["estatística", "valor"]).set_index("estatística")
guardar("27_diario_resumo", diario_stats)
add_md("Série diária: resumo", diario_stats)

# ---------------------------------------------------------------- 8 correlações gerais
cor = []
sp1 = stats.spearmanr(v["unit_price"], v["quantity"])
cor.append(("Preço unitário vs quantidade por linha", sp1.statistic, sp1.pvalue))
sp2 = stats.spearmanr(v["hour"], v["quantity"])
cor.append(("Hora vs quantidade por linha", sp2.statistic, sp2.pvalue))
sp3 = stats.spearmanr(diario["receita"], diario["data"].map(lambda d: d.toordinal()))
cor.append(("Receita diária vs tempo (tendência em 365 dias)", sp3.statistic, sp3.pvalue))
sp4 = stats.spearmanr(diario["receita"], diario["data"].dt.dayofweek)
cor.append(("Receita diária vs dia da semana", sp4.statistic, sp4.pvalue))
sp5 = stats.spearmanr(agg["preco_medio"], agg["unidades"])
cor.append(("Preço médio do produto vs unidades vendidas", sp5.statistic, sp5.pvalue))
sp6 = stats.spearmanr(agg["margem_pct"], agg["unidades"])
cor.append(("Margem % do produto vs unidades vendidas", sp6.statistic, sp6.pvalue))
sp7 = stats.spearmanr(diario["linhas"], diario["ticket_medio"].fillna(0))
cor.append(("Linhas por dia vs ticket médio por linha", sp7.statistic, sp7.pvalue))
df_cor = pd.DataFrame(cor, columns=["relação", "rho", "p_value"]).set_index("relação").round(4)
guardar("24_correlacoes_gerais", df_cor)
add_md("Correlações e testes (Spearman)", df_cor)

r_ru = np.corrcoef(diario["receita"], diario["unidades"])[0, 1]

mix = v.pivot_table(index="ym", columns="category", values="receita", aggfunc="sum").fillna(0)
mix_share = (mix.div(mix.sum(axis=1), axis=0) * 100).round(1)
mix_share.index.name = "mês"
guardar("25_mix_categoria_mensal", mix_share)
add_md("Mix de categorias por mês (% da receita)", mix_share)

ct2 = pd.crosstab(v["ym"], v["category"])
chi2b, pchi2b, dofb, _ = stats.chi2_contingency(ct2)
ct3 = pd.crosstab(ven["dow"], ven["hour"])
chi2c, pchi2c, dofc, _ = stats.chi2_contingency(ct3)

# ticket médio por dia da semana
tick_dow = diario.groupby("dow").agg(ticket=("receita", "sum"), linhas=("linhas", "sum"))
tick_dow["ticket_medio"] = (tick_dow["ticket"] / tick_dow["linhas"]).round(2)
tick_dow.index = [DIAS_PT[i] for i in tick_dow.index]
tick_dow.index.name = "dia_da_semana"
tick_dow = tick_dow[["ticket_medio"]]
guardar("26_ticket_medio_dia_semana", tick_dow)

# ---------------------------------------------------------------- gráficos
plt.rcParams.update({"figure.dpi": 130, "font.size": 9, "axes.grid": True, "grid.alpha": 0.25,
                     "axes.spines.top": False, "axes.spines.right": False})
AZUL, ROSA, ROXO, CINZA = "#3b6ea5", "#e6197d", "#5b3a8e", "#8a8a8a"

fig, ax = plt.subplots(figsize=(11, 3.6))
ax.plot(diario["data"], diario["receita"], color=CINZA, lw=0.7, label="Receita diária")
ax.plot(diario["data"], diario["receita"].rolling(30, min_periods=7).mean(), color=ROSA, lw=2,
        label="Média móvel de 30 dias")
ax.set_title("Receita diária (2025-11-01 a 2026-10-31)")
ax.set_ylabel("EUR"); ax.legend(frameon=False, ncol=2)
fig.tight_layout(); fig.savefig(os.path.join(GRAF, "01_receita_diaria.png")); plt.close(fig)

fig, ax = plt.subplots(figsize=(8, 3.4))
lab = [f"{MESES_PT[m-1]}/{str(a)[2:]}" for a, m in mensal[["ano", "mes"]].values]
cores = [ROXO if a == 2025 else AZUL for a in mensal["ano"]]
ax.bar(lab, mensal["receita"], color=cores)
for i, val in enumerate(mensal["receita"]):
    ax.text(i, val + 12, f"{val:.0f}", ha="center", fontsize=7)
ax.set_title("Receita por mês (roxo = 2025, azul = 2026)")
ax.set_ylabel("EUR")
fig.tight_layout(); fig.savefig(os.path.join(GRAF, "02_receita_mensal.png")); plt.close(fig)

fig, ax = plt.subplots(figsize=(8, 3.2))
ax.bar(dow.index, dow["receita/dia"], color=[ROSA if i >= 5 else AZUL for i in range(7)])
ax.set_title("Receita média por dia da semana (EUR/dia)")
ax.set_ylabel("EUR/dia")
fig.tight_layout(); fig.savefig(os.path.join(GRAF, "03_dia_semana.png")); plt.close(fig)

fig, ax = plt.subplots(figsize=(8, 3.2))
ax.bar(horas.index, horas["receita"], color=AZUL)
ax2 = ax.twinx(); ax2.plot(horas.index, horas["unidades"], color=ROSA, marker="o", lw=1.6)
ax2.set_ylabel("unidades"); ax2.grid(False)
ax.set_title("Receita (barras) e unidades (linha) por hora")
ax.set_xlabel("hora"); ax.set_ylabel("EUR")
fig.tight_layout(); fig.savefig(os.path.join(GRAF, "04_horas.png")); plt.close(fig)

fig, ax = plt.subplots(figsize=(9, 3.4))
im = ax.imshow(hm.values, aspect="auto", cmap="magma")
ax.set_xticks(range(hm.shape[1])); ax.set_xticklabels(hm.columns)
ax.set_yticks(range(7)); ax.set_yticklabels(hm.index)
ax.set_title("Receita por dia da semana × hora (EUR)")
ax.grid(False); fig.colorbar(im, ax=ax, shrink=0.85)
fig.tight_layout(); fig.savefig(os.path.join(GRAF, "05_heatmap_dia_hora.png")); plt.close(fig)

top10 = rent.reset_index().sort_values("lucro").tail(10)
fig, ax = plt.subplots(figsize=(8, 3.8))
ax.barh(top10["produto"], top10["lucro"], color=ROSA)
ax.set_title("Top 10 produtos por lucro bruto (365 dias)")
ax.set_xlabel("EUR")
fig.tight_layout(); fig.savefig(os.path.join(GRAF, "06_top_lucro.png")); plt.close(fig)

fig, ax = plt.subplots(figsize=(7.5, 4.2))
ax.scatter(agg["unidades"], agg["margem_pct"], s=agg["lucro"] / 6, color=AZUL, alpha=0.7,
           edgecolor="white", linewidth=0.8)
for _, r in agg.sort_values("lucro", ascending=False).head(12).iterrows():
    ax.annotate(r["name"], (r["unidades"], r["margem_pct"]), fontsize=6,
                xytext=(5, 4), textcoords="offset points")
ax.set_xlabel("unidades vendidas (365 dias)"); ax.set_ylabel("margem bruta (%)")
ax.set_xlim(0, agg["unidades"].max() * 1.08)
ax.set_title("Volume vs margem (tamanho da bolha = lucro; 12 maiores em lucro)")
fig.tight_layout(); fig.savefig(os.path.join(GRAF, "07_margem_vs_volume.png")); plt.close(fig)

fig, ax = plt.subplots(figsize=(9, 3.4))
for c, corc in zip(pgm_share.columns, [ROSA, AZUL, ROXO]):
    ax.plot(pgm_share.index, pgm_share[c], marker="o", lw=1.8, color=corc, label=c)
ax.set_title("Share mensal da receita por meio de pagamento (%)")
ax.set_ylabel("%"); ax.tick_params(axis="x", rotation=45); ax.legend(frameon=False)
fig.tight_layout(); fig.savefig(os.path.join(GRAF, "08_pagamentos_share.png")); plt.close(fig)

fig, ax = plt.subplots(figsize=(9, 7.5))
im = ax.imshow(corr.values, cmap="coolwarm", vmin=-1, vmax=1)
ax.set_xticks(range(len(corr))); ax.set_xticklabels(corr.columns, rotation=90, fontsize=7)
ax.set_yticks(range(len(corr))); ax.set_yticklabels(corr.index, fontsize=7)
ax.set_title("Correlação (Spearman) entre produtos — share semanal")
ax.grid(False); fig.colorbar(im, ax=ax, shrink=0.8)
fig.tight_layout(); fig.savefig(os.path.join(GRAF, "09_correlacao_produtos.png")); plt.close(fig)

fig, ax = plt.subplots(figsize=(9, 3.4))
bottom = np.zeros(len(mix_share))
for c, corc in zip(mix_share.columns, [AZUL, ROSA, ROXO, CINZA]):
    ax.bar(mix_share.index, mix_share[c], bottom=bottom, label=c, color=corc)
    bottom += mix_share[c].values
ax.set_title("Mix de categorias por mês (% da receita)")
ax.set_ylabel("%"); ax.tick_params(axis="x", rotation=45)
ax.legend(frameon=False, ncol=4, fontsize=8)
fig.tight_layout(); fig.savefig(os.path.join(GRAF, "10_mix_categorias.png")); plt.close(fig)

# ---------------------------------------------------------------- resumo
resumo = {
    "fonte": SRC,
    "intervalo": [str(ven["data"].min().date()), str(ven["data"].max().date())],
    "dias_cobertos": int(DIAS_TOTAL),
    "linhas_vendas": int(len(ven)),
    "receita_total": round(float(ven["receita"].sum()), 2),
    "custo_total": round(float(v["cost_price"].mul(v["quantity"]).sum()), 2),
    "lucro_total": round(float(v["lucro"].sum()), 2),
    "margem_global_pct": round(float(v["lucro"].sum() / ven["receita"].sum() * 100), 1),
    "unidades": int(ven["quantity"].sum()),
    "ticket_medio_linha": round(float(ven["receita"].mean()), 2),
    "linhas_por_dia": round(float(len(ven) / DIAS_TOTAL), 2),
    "receita_por_dia": round(float(ven["receita"].sum() / DIAS_TOTAL), 2),
    "ano_2025": {"dias": int(anual.loc[2025, "dias"]),
                 "receita": round(float(anual.loc[2025, "receita"]), 2),
                 "unidades": int(anual.loc[2025, "unidades"]),
                 "receita_dia": round(float(anual.loc[2025, "receita_dia"]), 2)},
    "ano_2026": {"dias": int(anual.loc[2026, "dias"]),
                 "receita": round(float(anual.loc[2026, "receita"]), 2),
                 "unidades": int(anual.loc[2026, "unidades"]),
                 "receita_dia": round(float(anual.loc[2026, "receita_dia"]), 2)},
    "top_lucro": rent.reset_index().head(5)[["produto", "lucro"]].to_dict("records"),
    "top_receita": por_prod.head(5)[["name", "receita"]].to_dict("records"),
    "top_unidades": top_qtd.head(5)[["name", "unidades"]].to_dict("records"),
    "pagamentos": {k: float(x) for k, x in pg["part_receita_%"].items()},
    "pares_corr_top": pares.head(5).to_dict("records"),
    "pares_corr_bottom": pares.tail(5).to_dict("records"),
}
for k in ("top_lucro",):
    for r in resumo[k]:
        r["lucro"] = round(float(r["lucro"]), 2)
for k in ("top_receita", "top_unidades"):
    for r in resumo[k]:
        for kk, vv in r.items():
            if isinstance(vv, (np.floating, float)):
                r[kk] = round(float(vv), 2)
for k in ("pares_corr_top", "pares_corr_bottom"):
    for r in resumo[k]:
        r["rho"] = round(float(r["rho"]), 3)

with open(os.path.join(OUT, "resumo.json"), "w", encoding="utf-8") as f:
    json.dump(resumo, f, ensure_ascii=False, indent=2)

with open(os.path.join(OUT, "_tabelas.md"), "w", encoding="utf-8") as f:
    f.write("".join(md))

print("OK | csv:", len(csvs), "| pasta:", OUT)
print("receita", resumo["receita_total"], "| lucro", resumo["lucro_total"],
      "| margem", resumo["margem_global_pct"])
print("gaps:", list(dias_em_falta.date))
print("precos divergentes:", n_pdif)
print("mannwhitney p:", round(mw.pvalue, 6), "| chi2 pgto x mes p:", round(pchi, 4),
      "| kruskal p:", round(kw.pvalue, 4))
print("chi2 cat x mes p:", round(pchi2b, 4), "| chi2 dow x hora p:", round(pchi2c, 4))
print("tendencia 2026 slope/p:", round(lr.slope, 4), round(lr.pvalue, 4))
print("corr receita/unidades:", round(r_ru, 3), "| r critico 5%:", round(r_crit, 3))
print("n80 pareto:", n80)
print("produtos vendidos>stock:", int((vendidos["unidades"] > vendidos["stock"]).sum()))
