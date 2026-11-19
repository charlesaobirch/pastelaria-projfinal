# Paleta

Simulação da paleta da imagem nos dashboards `design/pastelaria.pen`
(`Dashboard Visão Geral` e `Dashboard Vendas`).

## Cores base

| Token | HEX | RGB | CMYK | Uso no produto |
|---|---|---|---|---|
| Prussian Blue | `#122435` | 18, 36, 53 | 66, 32, 0, 79 | sidebar, títulos e valores principais, série de destaque |
| Indigo Dye | `#224766` | 34, 71, 102 | 67, 30, 0, 60 | dados (linha, barras e barras de quota), texto secundário, item de menu activo |
| Anti-flash | `#EFEFEF` | 239, 239, 239 | 0, 0, 0, 6 | fundo da página, faixas de tabela, tracks e toggles |
| Sinopia | `#CC361E` | 204, 54, 30 | 0, 74, 85, 20 | alertas (esgotado/baixo), variações negativas, ponto do pico |
| Silver | `#B3B3B3` | 179, 179, 179 | 0, 0, 0, 30 | dados secundários (barras comparativas), estados neutros |

## Derivados

Tints e neutros gerados a partir das cinco cores (não introduzem matiz novo):

| Uso | HEX | Origem |
|---|---|---|
| Texto suave / notas | `#5E6A76` | Prussian a 68 % sobre branco |
| Menu inactivo (sobre sidebar) | `#9AA7B4` | Prussian + branco |
| Borda de cartão | `#E1E6EA` | Prussian a 10 % |
| Borda de campo (select) | `#D5DCE3` | Prussian a 15 % |
| Divisor de linha de tabela | `#E7EBEF` | Prussian a 8 % |
| Grelha de gráfico | `#E6EBF0` / `#C3CED8` | Prussian a 8 % / 20 % |
| Tint informativo | `#E4ECF4` | Indigo a 12 % |
| Tint de alerta | `#FDEEEC` | Sinopia a 10 % |
| Área do gráfico | `#EAF0F5` | Indigo a 8 % |
| Heatmap (5 passos) | `#EFEFEF` → `#D3DFEA` → `#A9BFD2` → `#4E7295` → `#122435` | Anti-flash até Prussian |

## Regras

- **Sinopia só para atenção**: stock esgotado/baixo, variações negativas, ponto do pico. Nunca como cor de série de dados.
- **Silver nunca em texto**: apenas barras secundárias, grelha e estados vazios.
- **Todos os números usam Prussian**; as etiquetas usam Indigo; notas e metadados usam `#5E6A76`.
- Contraste: navy/branco 16:1 · indigo/branco 9,7:1 · sinopia/branco 5,1:1 · sinopia sobre `#FDEEEC` 4,6:1 · texto suave 4,9:1.

## Tokens para a app

```css
:root {
  --color-prussian: #122435;
  --color-indigo: #224766;
  --color-antiflash: #efefef;
  --color-sinopia: #cc361e;
  --color-silver: #b3b3b3;

  --text-default: var(--color-prussian);
  --text-secondary: var(--color-indigo);
  --text-muted: #5e6a76;
  --surface: #ffffff;
  --page: var(--color-antiflash);
  --border: #e1e6ea;
}
```
