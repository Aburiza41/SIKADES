import { Link } from '@inertiajs/react';
export default function NavLink({ active = false, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={
                'rounded inline-flex items-center px-8 py-2 text-lg font-medium leading-5 transition duration-500 ease-in-out focus:outline-none ' +
                (active
                    ? 'text-white bg-green-900 hover:bg-green-700 focus:bg-green-700 font-bold'
                    : 'border-transparent text-gray-700 hover:bg-green-100 hover:text-green-900 focus:bg-green-100 focus:text-green-900') +
                className
            }
        >
            {children}
        </Link>
    );
}
