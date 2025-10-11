import React from "react";
import { Button } from "@/components/ui/button";

// Test component to demonstrate error boundary
const ErrorTestComponent = () => {
    const [shouldThrow, setShouldThrow] = React.useState(false);

    if (shouldThrow) {
        throw new Error(
            "This is a test error to demonstrate the error boundary!"
        );
    }

    return (
        <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Error Boundary Test</h3>
            <p className="text-gray-600 mb-4">
                Click the button below to trigger an error and see the error
                boundary in action.
            </p>
            <Button onClick={() => setShouldThrow(true)} variant="destructive">
                Trigger Error
            </Button>
        </div>
    );
};

export default ErrorTestComponent;
