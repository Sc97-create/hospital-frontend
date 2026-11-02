import "../authentication/Login.css";
import "./license-expired.css";
import { Button } from "antd";
import { Link } from "react-router-dom";
import { LICENSE_CONTACT_EMAIL } from "./constants";

function LicenseExpiredPage() {
    return (
        <div className="login-page">
            <aside className="login-brand">
                <div className="login-brand-logo">
                    <img
                        src="/sample-icon.ico"
                        alt=""
                        className="login-brand-logo-mark"
                    />
                    <span className="login-brand-logo-name">Hospital Management System</span>
                </div>
                <div className="login-brand-content">
                    <h1 className="login-brand-headline">License expired</h1>
                    <p className="login-brand-support">
                        Access stays paused until the organisation license is renewed.
                    </p>
                </div>
            </aside>

            <main className="login-form-panel">
                <div className="login-form-shell">
                    <header className="login-form-header">
                        <h2 className="login-form-title">License expired</h2>
                        <p className="login-form-subtitle license-expired-copy">
                            Your organisation license has expired. Please contact{" "}
                            <a
                                className="license-expired-email"
                                href={`mailto:${LICENSE_CONTACT_EMAIL}`}
                            >
                                {LICENSE_CONTACT_EMAIL}
                            </a>
                            .
                        </p>
                    </header>

                    <Button
                        type="primary"
                        className="login-submit-button"
                        block
                        size="large"
                        href={`mailto:${LICENSE_CONTACT_EMAIL}`}
                    >
                        Contact {LICENSE_CONTACT_EMAIL}
                    </Button>

                    <div className="auth-links license-expired-back">
                        <Link to="/login">Back to Sign in</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default LicenseExpiredPage;
