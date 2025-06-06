"use client"

import { Component, ErrorInfo, ReactNode } from "react"

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
}

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