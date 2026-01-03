// NexVyapaar unique brand icon component

export function NexVyapaarIcon({ className = "w-6 h-6" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Modern geometric design representing growth and connectivity */}

            {/* Outer circle - representing completeness */}
            <circle
                cx="20"
                cy="20"
                r="18"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.3"
            />

            {/* Central upward arrow/triangle - representing growth */}
            <path
                d="M20 8L28 20H12L20 8Z"
                fill="currentColor"
                opacity="0.9"
            />

            {/* Three connected nodes - representing business network */}
            <circle cx="12" cy="28" r="3" fill="currentColor" />
            <circle cx="20" cy="32" r="3" fill="currentColor" />
            <circle cx="28" cy="28" r="3" fill="currentColor" />

            {/* Connection lines */}
            <line
                x1="12"
                y1="28"
                x2="20"
                y2="32"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <line
                x1="28"
                y1="28"
                x2="20"
                y2="32"
                stroke="currentColor"
                strokeWidth="1.5"
            />

            {/* Spark at top - innovation */}
            <circle cx="20" cy="8" r="2" fill="currentColor" className="animate-pulse" />
        </svg>
    );
}

// Alternative simpler icon version
export function NexVyapaarIconSimple({ className = "w-6 h-6" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Stylized "N" + "V" forming an upward arrow */}
            <path
                d="M10 30 L10 10 L20 25 L20 10 L30 10 L30 30 L20 15 L20 30 Z"
                fill="currentColor"
                opacity="0.95"
            />

            {/* Accent dot */}
            <circle cx="35" cy="10" r="2.5" fill="currentColor" className="opacity-70" />
        </svg>
    );
}
