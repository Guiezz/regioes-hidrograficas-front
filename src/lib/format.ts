const NBSP = " ";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export function formatBRL(valor: number): string {
  return brl.format(valor);
}

const ESCALAS: { limite: number; singular: string; plural: string }[] = [
  { limite: 1e9, singular: "bilhão", plural: "bilhões" },
  { limite: 1e6, singular: "milhão", plural: "milhões" },
  { limite: 1e3, singular: "mil", plural: "mil" },
];

export function formatBRLResumido(valor: number): string {
  const escala = ESCALAS.find((e) => valor >= e.limite);
  if (!escala) return formatBRL(valor);
  const n = Math.round((valor / escala.limite) * 100) / 100;
  const unidade = n < 2 ? escala.singular : escala.plural;
  return `R$${NBSP}${decimal.format(n)}${NBSP}${unidade}`;
}
