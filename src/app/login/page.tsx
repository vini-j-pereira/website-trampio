import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
            <Link
                href="/"
                className="absolute top-8 left-8 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Home
            </Link>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border p-8">
                <div className="text-center mb-8">
                    <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">T</span>
                    </div>
                    <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
                    <p className="text-muted-foreground mt-2">
                        Acesse sua conta para continuar
                    </p>
                </div>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" htmlFor="password">
                            Senha
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                            <span className="text-muted-foreground">Lembrar-me</span>
                        </label>
                        <Link href="#" className="text-primary hover:underline font-medium">
                            Esqueceu a senha?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground font-semibold h-10 rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Entrar
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Não tem uma conta?{" "}
                    <Link href="/register" className="text-primary hover:underline font-medium">
                        Cadastre-se
                    </Link>
                </div>
            </div>
        </div>
    );
}
