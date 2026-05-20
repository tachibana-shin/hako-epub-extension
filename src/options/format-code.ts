export function formatCode(code: string): string {
  if (code.includes("\n") && code.trim().endsWith("}")) return code

  const trimmed = code.trim()

  const anonFn = trimmed.match(/^function\s*\(([^)]*)\)\s*{\s*([\s\S]*)\s*}\s*$/)
  if (anonFn) {
    const [, params, body] = anonFn
    return `function(${params}) {\n${indentBody(body)}\n}`
  }

  const arrowBlock = trimmed.match(/^(\([^)]*\)|\w+)\s*=>\s*{\s*([\s\S]*)\s*}\s*$/)
  if (arrowBlock) {
    const [, params, body] = arrowBlock
    return `${params} => {\n${indentBody(body)}\n}`
  }

  const method = trimmed.match(/^(\w+)\s*\(([^)]*)\)\s*{\s*([\s\S]*)\s*}\s*$/)
  if (method) {
    const [, name, params, body] = method
    return `${name}(${params}) {\n${indentBody(body)}\n}`
  }

  const arrowExpr = trimmed.match(/^(\([^)]*\)|\w+)\s*=>\s*(.+)$/)
  if (arrowExpr) {
    const [, params, body] = arrowExpr
    return `${params} => {\n${indentBody(body)}\n}`
  }

  return code
}

function indentBody(body: string): string {
  return body
    .trim()
    .split("\n")
    .map((line) => "  " + line)
    .join("\n")
}
