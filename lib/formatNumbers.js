export function formatCount(count) {
  if (typeof count !== 'number') return '0';
  if (count < 1000) return count.toString();
  if (count < 1000000) {
    const thousands = count / 1000;
    return thousands % 1 === 0 ? `${thousands}k` : `${thousands.toFixed(1)}k`;
  }
  if (count < 1000000000) {
    const millions = count / 1000000;
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
  }
  const billions = count / 1000000000;
  return billions % 1 === 0 ? `${billions}B` : `${billions.toFixed(1)}B`;
}
