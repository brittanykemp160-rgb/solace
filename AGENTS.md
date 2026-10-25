# Agents

Solace supports agentic workflows where the AI can take multiple steps to complete a task.

## How It Works

When you ask Solace to do something complex, it breaks the task into steps:

1. **Understand** - Parse your request and identify what needs to be done
2. **Plan** - Create a sequence of actions to accomplish the goal
3. **Execute** - Run each step, adjusting based on results
4. **Verify** - Check that the outcome matches your intent

## Capabilities

Agents can:

- Read and write files in your project
- Run shell commands (with your approval)
- Search your codebase
- Make multiple edits across files
- Install dependencies
- Run tests and fix failures

## Safety

All destructive actions require explicit approval. Solace will show you exactly what it plans to do before making changes.

```
Solace wants to:
  • Edit src/index.ts (3 changes)
  • Create src/utils/helper.ts
  • Run: npm install lodash

[Allow] [Deny] [Allow All]
```

## Examples

```bash
# Refactor a function across multiple files
solace "rename getUserData to fetchUser everywhere"

# Add a feature with tests
solace "add input validation to the signup form with tests"

# Debug and fix
solace "the login is broken, find and fix it"
```

## Limitations

- Agents work best on focused tasks
- Very large refactors may need to be broken into steps
- Network requests require explicit approval
