import router from '../src/routes/trophyAssigner';

test('trophyAssigner has existing route paths and proper corresponding methods', () => {
    const routes = [
        { path: "/", method: 'get'}
    ]

    routes.forEach((route) => {
        const match = router.stack.find(
            (s:any) => s.route.path === route.path && s.route.methods[route.method]
        );
        expect(match).toBeTruthy();
    });
});