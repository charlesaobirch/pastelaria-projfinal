# -*- coding: utf-8 -*-
"""
Prepara os JSON do projeto para consumo pela app.

- Corrige os tipos: os ficheiros recebidos trazem TODOS os campos numericos como
  texto ("id": "1", "unit_price": "2.8"). O browser nao deve fazer contas com
  strings, por isso a conversao fica aqui, uma vez.
- As datas ficam como texto "YYYY-MM-DD" (e o formato esperado pela app).
- Valida estrutura, integridade e totais. Se algo falhar, sai com erro.

Uso:
    python scripts/preparar_dados.py

Corre em public/data/ e e idempotente.
"""

import json
import os
import re
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "public", "data")

# chaves na ordem exata do Excel; tipo de destino por campo
SCHEMA = {
    "produtos": {
        "id": int,
        "name": str,
        "category": str,
        "unit_price": float,
        "cost_price": float,
        "stock": int,
        "min_stock": int,
    },
    "ingredientes": {
        "id": int,
        "name": str,
        "category": str,
        "unit": str,
        "unit_cost": float,
        "stock": int,
        "min_stock": int,
        "supplier": str,
    },
    "vendas": {
        "id": int,
        "date": str,
        "hour": int,
        "product_id": int,
        "quantity": int,
        "unit_price": float,
        "payment_method": str,
    },
}

ESPERADO = {
    "linhas": {"produtos": 21, "ingredientes": 16, "vendas": 4583},
    "receita": 11389.70,
    "unidades": 7643,
    "lucro": 8319.78,
}

DATA_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def carregar(nome):
    caminho = os.path.join(DATA, nome + ".json")
    with open(caminho, encoding="utf-8-sig") as f:
        return json.load(f)


def converter(nome, registos):
    schema = SCHEMA[nome]
    corrigidos = 0
    for r in registos:
        if list(r.keys()) != list(schema):
            raise SystemExit(f"[{nome}] chaves fora de ordem/esperado: {list(r.keys())}")
        for campo, tipo in schema.items():
            valor = r[campo]
            if tipo is str:
                if not isinstance(valor, str):
                    r[campo] = str(valor)
                    corrigidos += 1
                continue
            if isinstance(valor, str):
                corrigidos += 1
            r[campo] = tipo(float(valor)) if tipo is int else float(valor)
    return corrigidos


def validar(nome, registos):
    erros = []
    if len(registos) != ESPERADO["linhas"][nome]:
        erros.append(f"{nome}: {len(registos)} linhas, esperado {ESPERADO['linhas'][nome]}")

    for i, r in enumerate(registos):
        for campo, tipo in SCHEMA[nome].items():
            if not isinstance(r[campo], tipo) or isinstance(r[campo], bool):
                erros.append(f"{nome}[{i}].{campo} = {r[campo]!r} ({type(r[campo]).__name__})")
        if any(v is None for v in r.values()):
            erros.append(f"{nome}[{i}] tem nulo")

    if nome == "vendas":
        for i, r in enumerate(registos):
            if not DATA_RE.match(r["date"]):
                erros.append(f"vendas[{i}].date = {r['date']!r}")
            if r["quantity"] < 1:
                erros.append(f"vendas[{i}].quantity = {r['quantity']}")
        if len({r["id"] for r in registos}) != len(registos):
            erros.append("vendas: id duplicado")
    return erros


def main():
    dados = {n: carregar(n) for n in SCHEMA}

    total_corrigidos = {n: converter(n, dados[n]) for n in SCHEMA}

    erros = []
    for n in SCHEMA:
        erros += validar(n, dados[n])

    # integridade referencial
    ids_produtos = {p["id"] for p in dados["produtos"]}
    orfaos = sorted({v["product_id"] for v in dados["vendas"]} - ids_produtos)
    if orfaos:
        erros.append(f"vendas com product_id inexistente: {orfaos}")

    # totais de controlo (tem de fechar com docs/analise/resumo.json)
    custo = {p["id"]: p["cost_price"] for p in dados["produtos"]}
    receita = sum(v["unit_price"] * v["quantity"] for v in dados["vendas"])
    unidades = sum(v["quantity"] for v in dados["vendas"])
    lucro = sum((v["unit_price"] - custo[v["product_id"]]) * v["quantity"] for v in dados["vendas"])

    if round(receita, 2) != ESPERADO["receita"]:
        erros.append(f"receita {receita:.2f}, esperado {ESPERADO['receita']}")
    if unidades != ESPERADO["unidades"]:
        erros.append(f"unidades {unidades}, esperado {ESPERADO['unidades']}")
    if round(lucro, 2) != ESPERADO["lucro"]:
        erros.append(f"lucro {lucro:.2f}, esperado {ESPERADO['lucro']}")

    if erros:
        print("FALHOU")
        for e in erros[:20]:
            print(" -", e)
        sys.exit(1)

    for n in SCHEMA:
        caminho = os.path.join(DATA, n + ".json")
        with open(caminho, "w", encoding="utf-8", newline="\n") as f:
            json.dump(dados[n], f, ensure_ascii=False, indent=2)
            f.write("\n")

    print("OK")
    for n in SCHEMA:
        print(f"  {n}: {len(dados[n])} registos, {total_corrigidos[n]} campos convertidos")
    print(f"  receita {receita:,.2f} | unidades {unidades:,} | lucro {lucro:,.2f}")


if __name__ == "__main__":
    main()
