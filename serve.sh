#!/bin/bash
cd "$(dirname "$0")"
exec powershell -ExecutionPolicy Bypass -File serve.ps1
