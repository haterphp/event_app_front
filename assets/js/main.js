let host = 'http://apitest.larin.site/wsrntt1m3/api/v1/';

let f = async (url, method = 'get', data = null, useToken = false) => {

    method = method.toUpperCase();

    let options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (useToken) {
        options.headers['Authorization'] = `Bearer ${app.user.token}`;
    }

    if (method === 'POST') {
        options.body = JSON.stringify(data);
    }


    let result = await fetch(`${host}${url}`, options);

    if (url === 'logout') {
        return true;
    }
    return await result.json();
}


let app = new Vue({
    el: "#app",
    data: {
        page: "home",
        authOpen: false,
        user: {
            token: null
        },
        home: {
            events: [],

        },
        current: {
            event: [],
            booking: {
                fields: {
                    visitors: []
                },
                errors: {}
            }
        },
        myBookings: {
            bookings: [],
            selectBooking: []
        },
        auth: {
            page: 'login',
            login: {
                fields: {
                    email: "",
                    password: "",
                },
                errors: {}
            },
            register: {
                fields: {
                    first_name: "",
                    last_name: "",
                    email: "",
                    password: "",
                    instant_authorization: true
                },
                errors: {}
            }
        }
    },
    async created() {
        this.page = localStorage.getItem('page') || 'home';
        this.authOpen = localStorage.getItem('auth') || false;
        this.user.token = localStorage.getItem('token') || null;
        if (this.authOpen == 'true') {
            this.auth.page = localStorage.getItem('auth_page') || 'login';
        }
        await this.getAllEvents();
        await this.Bookings();
    },

    methods: {
        isSelectPage(page) {
            return this.page == page;
        },
        isExistField(field, array) {
            return field in array;
        },
        isAuthPage(page) {
            return page == this.auth.page;
        },
        async go(page) {

            if (this.page == 'home') {

                await this.getAllEvents();
            } else if (this.page === 'my_bookings') {
                await this.Bookings();

            }

            this.page = page;
            closeMenu('#menu', '#menu-nav');
            localStorage.setItem('page', this.page);
        },
        goToAuth() {
            this.authOpen = 'true';
            setTimeout(() => formAuthOpen(), 10);
            localStorage.setItem('auth', this.authOpen);
            setTimeout(() => closeMenu('#menu', '#menu-nav'), 210);
        },
        closeAuth() {
            formAuthClose();
            setTimeout(() => {
                this.authOpen = false;
                localStorage.removeItem('auth');
            }, 210)
        },
        addVisitor() {
            this.current.booking.fields.visitors.push({
                first_name: "",
                last_name: "",
                birthday: "",
                options: [],
                errors: {}
            })
            $('.c-checkbox').prop('indeterminate', true)
        },
        optionVisitorChange(visitorId, optionId) {
            let idx = this.current.booking.fields.visitors[visitorId].options.indexOf(optionId);
            if (idx === -1) {
                this.current.booking.fields.visitors[visitorId].options.push(optionId);
                return;
            }
            this.current.booking.fields.visitors[visitorId].options.splice(idx, 1);

        },
        deleteVisitor(visitor) {
            let idx = this.current.booking.fields.visitors.indexOf(visitor);
            if (idx !== -1) {
                this.current.booking.fields.visitors.splice(idx, 1);
            }
        },
        getCurrentBooking(code) {
            this.myBookings.selectBooking = this.myBookings.bookings.find(book => book.code == code);
            this.page = 'my_bookings_current';
        },
        async getAllEvents() {
            this.home.events = await f('events');
        },
        async getCurrentEvent(slug) {
            this.current.event = await f(`events/${slug}`);
            this.current.booking = {
                fields: {
                    visitors: []
                },
                errors: {}
            };
            this.page = 'current';
        },
        async Login() {
            let result = await f('login', 'post', this.auth.login.fields);
            if (result.token) {
                this.user.token = result.token;
                await this.getAllEvents();
                this.closeAuth();
                this.auth.login.fields = {
                    first_name: "",
                    last_name: "",
                    email: "",
                    password: "",
                    instant_authorization: true
                };
                localStorage.setItem('token', this.user.token);
                return;
            }
            this.auth.login.errors = result;
            await setTimeout(() => this.auth.login.errors = {}, 2000);

        },
        async Register() {
            let result = await f('register', 'post', this.auth.register.fields);

            if (result.id) {
                this.user.token = result.token;
                await this.getAllEvents();
                this.closeAuth();
                this.auth.register.fields = {
                    email: "",
                    password: "",
                };
                localStorage.setItem('token', this.user.token);
                return;
            }
            this.auth.register.errors = result;
            await setTimeout(() => this.auth.register.errors = {}, 2000);
        },
        async LogOut() {
            let result = await f('logout', 'post', null, true);
            this.user.token = null;
            localStorage.removeItem('token');
            if(['my_bookings', 'my_bookings_current'].includes(this.page)){
                this.go('home');
            }
        },
        async Bookings() {
            this.myBookings.bookings = await f('booking', 'get', null, true);
        },
        async Booking(slug) {
            let result = await f(`events/${slug}/booking`, 'post', this.current.booking.fields, true);
            if (result.code) {
                await this.Bookings();
                this.go('my_bookings');
                this.page = 'my_bookings_current';
                this.myBookings.selectBooking = result;
                return;
            }
            this.current.booking.errors = result;
            if (!result.visitors) {
                for (let key in this.current.booking.errors) {
                    let keyPart = key.slice().split('.');
                    let arr = this.current.booking.errors[key].split(' ');
                    let name = arr[1].split('.').splice(-1, 2).join(' ');
                    arr[1] = name;
                    this.current.booking.fields.visitors[keyPart[1]].errors[keyPart[2]] = arr.join(' ');
                }
            }
            setTimeout(() => {
                this.current.booking.errors = []
                this.current.booking.fields.visitors.forEach(e => {
                    e.errors = {};
                })
            }, 5000);
            console.log(result);
        }
    }
})
// let time = 0;
// let loop = () => {
//     requestAnimationFrame(async () => {
//         time++;
//         if (time % 600 === 0) {
//             if (app.page === 'home' && app.authOpen != 'true') {
//                 await app.getAllEvents();
//             }
//         }
//         loop();
//     });
// }
// loop();