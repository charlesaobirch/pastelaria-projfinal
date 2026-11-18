import type { Ingrediente, Produto, Venda } from "@/types";

/**
 * Única porta para os ficheiros de `public/data/`.
 *
 * Aqui não há contas nem decisões de negócio: só ler, validar a forma e
 * devolver. Se um número vier entre aspas, isto falha alto com uma mensagem
 * que diz o ficheiro e a linha — em vez de deixar um `NaN` chegar a um gráfico.
 */

const DATA_PATH = "/data";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type FieldType = "number" | "string";
type Row = Record<string, unknown>;

export interface DataSet {
  produtos: Produto[];
  ingredientes: Ingrediente[];
  vendas: Venda[];
}

async function fetchRows(file: string): Promise<Row[]> {
  const response = await fetch(`${DATA_PATH}/${file}.json`);

  if (!response.ok) {
    throw new Error(
      `Não foi possível ler ${file}.json (HTTP ${response.status}).`,
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      `${file}.json devia ser uma lista de registos e veio vazia.`,
    );
  }

  return data as Row[];
}

/**
 * Confirma que todos os registos têm as chaves esperadas e com o tipo certo.
 * Percorre todas as linhas (4 583 × 7 verificações custa milissegundos) para
 * não deixar passar uma string na linha 2 000.
 */
function assertShape(
  file: string,
  rows: Row[],
  spec: Record<string, FieldType>,
): void {
  const first = rows[0];

  for (const key of Object.keys(spec)) {
    if (!(key in first)) {
      throw new Error(`${file}.json não tem o campo "${key}".`);
    }
  }

  rows.forEach((row, index) => {
    for (const [key, type] of Object.entries(spec)) {
      if (typeof row[key] !== type) {
        throw new Error(
          `${file}.json: linha ${index + 1} tem "${key}" = ${JSON.stringify(row[key])}; esperava ${type}. Corre scripts/preparar_dados.py.`,
        );
      }
    }
  });
}

const PRODUTO_FIELDS: Record<string, FieldType> = {
  id: "number",
  name: "string",
  category: "string",
  unit_price: "number",
  cost_price: "number",
  stock: "number",
  min_stock: "number",
};

const INGREDIENTE_FIELDS: Record<string, FieldType> = {
  id: "number",
  name: "string",
  category: "string",
  unit: "string",
  unit_cost: "number",
  stock: "number",
  min_stock: "number",
  supplier: "string",
};

const VENDA_FIELDS: Record<string, FieldType> = {
  id: "number",
  date: "string",
  hour: "number",
  product_id: "number",
  quantity: "number",
  unit_price: "number",
  payment_method: "string",
};

export async function fetchProdutos(): Promise<Produto[]> {
  const rows = await fetchRows("produtos");
  assertShape("produtos", rows, PRODUTO_FIELDS);
  // A validação acima garante a forma; o cast é só para o TypeScript.
  return rows as unknown as Produto[];
}

export async function fetchIngredientes(): Promise<Ingrediente[]> {
  const rows = await fetchRows("ingredientes");
  assertShape("ingredientes", rows, INGREDIENTE_FIELDS);
  return rows as unknown as Ingrediente[];
}

export async function fetchVendas(): Promise<Venda[]> {
  const rows = await fetchRows("vendas");
  assertShape("vendas", rows, VENDA_FIELDS);

  rows.forEach((row, index) => {
    if (!DATE_PATTERN.test(String(row.date))) {
      throw new Error(
        `vendas.json: linha ${index + 1} tem date = ${JSON.stringify(row.date)}; esperava "YYYY-MM-DD".`,
      );
    }
  });

  return rows as unknown as Venda[];
}

/** Lê os três ficheiros em paralelo. O store chama isto uma única vez. */
export async function fetchAll(): Promise<DataSet> {
  const [produtos, ingredientes, vendas] = await Promise.all([
    fetchProdutos(),
    fetchIngredientes(),
    fetchVendas(),
  ]);

  return { produtos, ingredientes, vendas };
}
