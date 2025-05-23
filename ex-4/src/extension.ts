import * as vscode from 'vscode'
import { htmlElements } from './htmlElements'

const autocomplete = () =>
  vscode.commands.registerCommand('ex-4.autocomplete', async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }

    const position = editor.selection.active
    const line = editor.document.lineAt(position.line)
    const textBeforeCursor = line.text.substring(0, position.character)

    // Find the start of the Emmet expression
    const expressionStart = Math.max(
      textBeforeCursor.lastIndexOf(' ') + 1,
      textBeforeCursor.lastIndexOf('\n') + 1,
      0
    )

    const emmetExpression = textBeforeCursor.substring(expressionStart)

    // Check if it's a valid Emmet expression (starts with a tag name)
    if (!/^[a-zA-Z][a-zA-Z0-9]*/.test(emmetExpression)) {
      // Default tab behavior
      await vscode.commands.executeCommand('tab')
      return
    }

    const html = parseEmmet(emmetExpression)
    if (!html) {
      await vscode.commands.executeCommand('tab')
      return
    }

    // Replace the abbreviation with the generated HTML
    await editor.edit((editBuilder) => {
      const abbrevRange = new vscode.Range(
        position.line,
        expressionStart,
        position.line,
        position.character
      )
      editBuilder.replace(abbrevRange, html)
    })
  })

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(autocomplete())
}

export function deactivate() {}

// Enhanced EmmetNode type to store all tag information
type EmmetNode = {
  tag: string
  id?: string
  classes?: string[]
  content?: string
  attributes?: string
  multiplier?: number
  children: EmmetNode[]
  parent: EmmetNode | null
}

function parseEmmet(emmetStr: string): string | null {
  // Parse the entire expression at once
  const rootNode = buildEmmetTree(emmetStr)
  if (!rootNode) {
    return null
  }

  return generateHtmlFromTree(rootNode)
}

// Tokenize Emmet expression into meaningful parts
function tokenizeEmmet(emmetStr: string): { type: string; value: string }[] {
  const tokens: { type: string; value: string }[] = []
  let currentToken = ''
  let currentType = ''

  for (let i = 0; i < emmetStr.length; i++) {
    const char = emmetStr[i]

    if (['>', '+', '^'].includes(char)) {
      // If we have accumulated a token, push it
      if (currentToken) {
        tokens.push({ type: 'tag', value: currentToken })
        currentToken = ''
      }
      tokens.push({ type: 'operator', value: char })
    } else {
      // Accumulate tag tokens
      currentToken += char
    }
  }

  // Don't forget the last token
  if (currentToken) {
    tokens.push({ type: 'tag', value: currentToken })
  }

  return tokens
}

// Parse a tag including its attributes
function parseTag(tagStr: string): {
  tagName: string
  id?: string
  classes?: string[]
  content?: string
  attrs?: string
  multiplier?: number
} {
  const idMatch = tagStr.match(/#([\w-]+)/)
  const classMatches = tagStr.match(/\.([\w-]+)/g)
  const contentMatch = tagStr.match(/{([^}]+)}/)
  const attrMatch = tagStr.match(/\[([\w\s='"]+)\]/)
  const multiplierMatch = tagStr.match(/\*(\d+)/)

  // Extract tag name, defaulting to div if none is provided
  let tagName = tagStr.match(/^([a-zA-Z][a-zA-Z0-9]*)/)?.[1] || 'div'

  // For unknown tags, default to div
  if (!htmlElements.includes(tagName)) {
    tagName = 'div'
  }

  // Extract and process classes
  const classes = classMatches
    ? classMatches.map((c) => c.substring(1))
    : undefined

  return {
    tagName,
    id: idMatch ? idMatch[1] : undefined,
    classes,
    content: contentMatch ? contentMatch[1] : undefined,
    attrs: attrMatch ? attrMatch[1] : undefined,
    multiplier: multiplierMatch ? parseInt(multiplierMatch[1], 10) : undefined,
  }
}

function buildEmmetTree(emmetStr: string): EmmetNode | null {
  // First tokenize the string
  const tokens = tokenizeEmmet(emmetStr)
  if (!tokens.length) {
    return null
  }

  // Then build the tree
  const rootNode: EmmetNode = { tag: 'root', children: [], parent: null }
  let currentNode = rootNode

  // Process tokens and build tree
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token.type === 'tag') {
      // Parse the tag including its attributes
      const { tagName, id, classes, content, attrs, multiplier } = parseTag(
        token.value
      )

      // Create the node with all its properties
      const newNode: EmmetNode = {
        tag: tagName,
        id,
        classes,
        content,
        attributes: attrs,
        multiplier: multiplier || 1,
        children: [],
        parent: currentNode,
      }

      // Add to current position in tree
      currentNode.children.push(newNode)
      currentNode = newNode
    } else if (token.type === 'operator') {
      if (token.value === '>') {
        // Next tag will be a child - currentNode stays the same
      } else if (token.value === '+') {
        // Next tag will be a sibling - go up to parent
        currentNode = currentNode.parent || rootNode
      } else if (token.value === '^') {
        // Go up one level
        currentNode = currentNode.parent?.parent || rootNode
      }
    }
  }

  return rootNode
}

function generateHtmlFromTree(node: EmmetNode): string {
  if (node.tag === 'root') {
    return node.children.map((child) => generateHtmlFromTree(child)).join('')
  }

  // Generate HTML for this node
  const idAttr = node.id ? ` id="${node.id}"` : ''
  const classAttr =
    node.classes && node.classes.length
      ? ` class="${node.classes.join(' ')}"`
      : ''
  const contentText = node.content || ''
  const attrText = node.attributes ? ` ${node.attributes}` : ''

  // Generate child content
  const children = node.children
    .map((child) => generateHtmlFromTree(child))
    .join('')

  // Handle multiplier
  let result = ''
  const count = node.multiplier || 1
  for (let i = 0; i < count; i++) {
    const html = `<${node.tag}${idAttr}${classAttr}${attrText}>${contentText}${children}</${node.tag}>`
    result += html
  }

  return result
}
