#!/bin/zsh
# Solace zsh completions

_solace() {
    local -a commands
    commands=(
        'ask:Ask a one-shot question'
        'desktop:Open desktop app'
    )

    _arguments -C \
        '--help[Show help]' \
        '--version[Show version]' \
        '1: :->cmds' \
        '*::arg:->args'

    case "$state" in
        cmds)
            _describe -t commands 'commands' commands
            ;;
    esac
}

compdef _solace solace
