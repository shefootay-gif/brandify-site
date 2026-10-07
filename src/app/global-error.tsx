"use client";

// Last-resort error boundary (when a root layout itself fails).
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#021D4E", color: "#fff" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
          <div>
            <p style={{ fontSize: 72, fontWeight: 800, color: "#FF6B00", margin: 0 }}>500</p>
            <h1 style={{ fontSize: 28 }}>حدث خطأ غير متوقع — Something went wrong</h1>
            <button
              onClick={reset}
              style={{ marginTop: 16, padding: "12px 24px", border: 0, borderRadius: 10, background: "#FF6B00", color: "#01122F", fontWeight: 700, cursor: "pointer" }}
            >
              حاول مرة أخرى / Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
