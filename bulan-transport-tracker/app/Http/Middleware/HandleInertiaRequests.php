<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function handle(Request $request, Closure $next): SymfonyResponse
    {
        $response = parent::handle($request, $next);

        // Do not let the browser persist an Inertia JSON response for auth
        // pages. This prevents restored tabs/back-forward cache from showing
        // the raw Inertia payload instead of the graphical login page.
        if (
            $request->routeIs('login') ||
            $request->routeIs('password.*')
        ) {
            $response->headers->set(
                'Cache-Control',
                'no-store, no-cache, must-revalidate, max-age=0'
            );
            $response->headers->set('Pragma', 'no-cache');
        }

        return $response;
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'toast' => fn () => $request->session()->get('toast'),
            ],
        ];
    }
}
