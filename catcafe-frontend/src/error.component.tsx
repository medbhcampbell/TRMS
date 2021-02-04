
/* I want to define a component that will render either
 the child components within it or a default view if an error occurs */

import { Component, ErrorInfo, ReactNode } from "react";
interface Props {
    // allow us to have access to any elements that are children of this one.
    children: ReactNode;
}
// could place this in the redux store, but for demo we're just using useState
interface State {
    hasError: boolean;
    error: Error | null;
}

// Error Boundary is a component that will display a default view if it catches an error
// It's like a try/catch block but with components
class ErrorBoundaryComponent extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    }

    // getDerivedStateFromError: update the state so the next render will show our fallback instead of the error
    public static getDerivedStateFromError(err: Error): State {
        return { hasError: true, error: err };
    }

    // componentDidCatch: Hey, we caught an error
    // this is where I would log an error or do any cleanup stuff.
    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    // componentDidUpdate: Ok, so if there isn't an error anymore, just display things.
    public componentDidUpdate(previousProps: Props) {
        if(previousProps.children !== this.props.children) {
            this.setState( {hasError: false, error: null});
        }
    }

    public render() {
        if (this.state.hasError) {

            return (
                <>
                <h1> An error has occured, please contact support if this persists. </h1>
                {this.state.error?.name+': '+this.state.error?.message}
                </>
            )
        }
        return this.props.children;
    }
}

export default ErrorBoundaryComponent;