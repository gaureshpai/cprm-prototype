"use client"

import { Props, State } from "@/lib/interfaces"
import { Component, ErrorInfo } from "react"

export default class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false }

    static getDerivedStateFromError(_: Error): State {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || <div>Something went wrong</div>
        }

        return this.props.children
    }
}