import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import { HiExclamationCircle } from 'react-icons/hi';

const ErrorPage = () => {
  
    const error = useRouteError();
    console.error(error); 

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
            <HiExclamationCircle className="w-16 h-16 text-red-400 mb-4" />
            <h1 className="text-4xl font-bold text-gray-800">Oops! Something went wrong.</h1>
            <p className="mt-2 text-lg text-gray-600">We're sorry for the inconvenience. An unexpected error has occurred.</p>
            
            
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-red-100 rounded-md text-left text-sm text-red-700">
                    <p><strong>Error:</strong> {error.statusText || error.message}</p>
                </div>
            )}

            <Link 
                to="/dashboard"
                className="mt-8 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
            >
                Return to Dashboard
            </Link>
        </div>
    );
};

export default ErrorPage;