// Error handler to prevent extension-related errors from causing page reloads
export const setupErrorHandler = () => {
  // Handle unhandled promise rejections (like extension connection errors)
  window.addEventListener('unhandledrejection', (event) => {
    // Check if it's an extension connection error
    if (event.reason && 
        (event.reason.message?.includes('Could not establish connection') ||
         event.reason.message?.includes('Receiving end does not exist') ||
         event.reason.message?.includes('Extension context invalidated'))) {
      
      console.warn('Extension connection error suppressed:', event.reason.message);
      event.preventDefault(); // Prevent the error from causing page reload
      return;
    }
    
    // Log other errors but don't prevent them
    console.error('Unhandled promise rejection:', event.reason);
  });

  // Handle general errors
  window.addEventListener('error', (event) => {
    if (event.error && 
        (event.error.message?.includes('Could not establish connection') ||
         event.error.message?.includes('Receiving end does not exist') ||
         event.error.message?.includes('Extension context invalidated'))) {
      
      console.warn('Extension error suppressed:', event.error.message);
      event.preventDefault();
      return;
    }
  });
};

// Initialize error handler
setupErrorHandler();
