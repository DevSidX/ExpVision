import SignInForm from "./_component/signInForm";
import Logo from "../../components/logo/logo";
import auth_Page from "../../assets/auth_Page.png"
import auth_Page_dark from "../../assets/auth_Page_dark.png"
import { useTheme } from "../../context/theme-provider";

const SignIn = () => {
    const { theme } = useTheme();
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
            {/* LEFT SECTION */}
            <div className="flex flex-col gap-4 p-6 md:p-10 md:pt-6">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Logo url="/" />
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <SignInForm />
                    </div>
                </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="relative hidden lg:flex h-screen overflow-hidden border-l bg-gradient-to-br from-background via-muted/40 to-background">

                {/* BACKGROUND GLOW */}
                <div className="absolute inset-0">
                    <div className="absolute top-[-120px] right-[-120px] h-[350px] w-[350px] rounded-full bg-emerald-500/15 blur-3xl" />
                    <div className="absolute bottom-[-120px] left-[-120px] h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-3xl" />
                </div>

                <div className="relative z-10 flex h-full w-full flex-col px-10 py-8">

                    {/* TOP CONTENT */}
                    <div className="max-w-2xl">
                        {/* <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-muted-foreground backdrop-blur">
                            AI Powered Finance Management
                        </div> */}

                        <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight">
                            Manage your finances smarter with{" "}
                            <span className="text-emerald-500">
                                ExpVision
                            </span>
                        </h1>

                        <p className="mt-4 text-base leading-7 text-muted-foreground">
                            Track expenses, analyze spending patterns,
                            generate AI insights, import CSV transactions,
                            and manage recurring payments — all in one place.
                        </p>

                        {/* FEATURES */}
                        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl border bg-background/50 p-3 backdrop-blur">
                                📊 Smart Analytics
                            </div>

                            <div className="rounded-xl border bg-background/50 p-3 backdrop-blur">
                                🤖 AI Insights
                            </div>

                            <div className="rounded-xl border bg-background/50 p-3 backdrop-blur">
                                🔄 Recurring Transactions
                            </div>

                            <div className="rounded-xl border bg-background/50 p-3 backdrop-blur">
                                📁 CSV Import Support
                            </div>
                        </div>
                    </div>

                    {/* IMAGE */}
                    <div className="relative mt-6 flex flex-1 items-center justify-center overflow-hidden">
                        <div className="relative w-full max-w-4xl rounded-3xl border bg-background/40 p-3 shadow-2xl backdrop-blur-xl">

                            <img
                                src={
                                    theme === "dark"
                                        ? auth_Page_dark
                                        : auth_Page
                                }
                                alt="Dashboard Preview"
                                className="w-full rounded-2xl object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;