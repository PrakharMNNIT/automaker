# Autonomous Coding Agent Setup

This autonomous coding agent now uses the **Claude Code CLI directly** instead of the Python SDK.

## Prerequisites

1. **Claude Code** must be installed on your system
2. You must authenticate Claude Code for **headless mode** (--print flag)

## Authentication Setup

The `--print` (headless) mode requires a long-lived authentication token. To set this up:

### Option 1: Setup Token (Recommended)

Run this command in your own terminal (requires Claude subscription):

```bash
claude setup-token
```

This will open your browser and authenticate Claude Code for headless usage.

### Option 2: Use API Key

If you have an Anthropic API key instead:

```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

Or for OAuth tokens:

```bash
export CLAUDE_CODE_OAUTH_TOKEN='your-oauth-token-here'
```

## Usage

Once authenticated, run:

```bash
python3 autonomous_agent_demo.py --project-dir ./my_project --max-iterations 3
```

### Options:

- `--project-dir`: Directory for your project (default: `./autonomous_demo_project`)
- `--max-iterations`: Maximum number of agent iterations (default: unlimited)
- `--model`: Claude model to use (default: `opus` for Opus 4.5)

### Examples:

```bash
# Start a new project with Opus 4.5
python3 autonomous_agent_demo.py --project-dir ./my_app

# Limit iterations for testing
python3 autonomous_agent_demo.py --project-dir ./my_app --max-iterations 5

# Use a different model
python3 autonomous_agent_demo.py --project-dir ./my_app --model sonnet
```

## How It Works

The agent:

1. Creates configuration files (`.claude_settings.json`, `.mcp_config.json`)
2. Calls `claude --print` with your prompt
3. Captures the output and continues the autonomous loop
4. Uses your existing Claude Code authentication

## Troubleshooting

### "Invalid API key" Error

This means Claude Code isn't authenticated for headless mode. Run:

```bash
claude setup-token
```

### Check Authentication Status

Test if headless mode works:

```bash
echo "Hello" | claude --print --model opus
```

If this works, the autonomous agent will work too.

### Still Having Issues?

1. Make sure Claude Code is installed: `claude --version`
2. Check that you can run Claude normally: `claude`
3. Verify `claude` is in your PATH: `which claude`
4. Try re-authenticating: `claude setup-token`
