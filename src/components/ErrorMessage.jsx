import React from "react";

function ErrorMessage({
  message = "Something went wrong",
  retryAction = null,
  retryText = "Try Again",
  details = null,
}) {
  return (
    <div className="error-message">
      <div className="error-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>

      <h3 className="error-title">{message}</h3>

      {details && <p className="error-details">{details}</p>}

      {retryAction && (
        <button
          className="error-retry-button"
          onClick={retryAction}
          aria-label={retryText}
        >
          {retryText}
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
