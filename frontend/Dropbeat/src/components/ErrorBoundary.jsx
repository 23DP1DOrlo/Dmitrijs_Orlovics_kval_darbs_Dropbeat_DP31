import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message ?? "Unknown error",
    };
  }

  componentDidCatch(error, info) {

    console.error("ErrorBoundary caught runtime error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="panel">
          <h2>Kļūda lapas ielādē</h2>
          <p className="error">Neizdevās parādīt saturu. Atjauno lapu vai atgriezies atpakaļ.</p>
          <p className="small-text">{this.state.message}</p>
        </section>
      );
    }

    return this.props.children;
  }
}
