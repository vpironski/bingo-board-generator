import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-full px-4 pt-6 pb-24">
          <p className="text-red-500 font-medium mb-2">Something went wrong.</p>
          <p className="text-gray-500 text-sm text-center">{this.state.error?.message}</p>
          <button
            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
