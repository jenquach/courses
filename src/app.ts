import path from 'path'
import express from 'express'
import applyAuth from './middleware/auth'
import { registerLocals } from './middleware/locals'
import homeRoutes from './routes/home'
import courseRoutes from './routes/courses'
import publicProfileRoutes from './routes/public-profile'
import categoryRoutes from './routes/categories'
import accountRoutes from './routes/account'
import testRoutes from './routes/test'
import { apply404handler } from './middleware/404'
import { Driver } from 'neo4j-driver'
import { registerSession } from './middleware/session'
import { initBugsnag, useErrorHandler, useRequestHandler } from './middleware/bugsnag'

export default function initApp(driver: Driver) {
    const app = express()

    app.use((req, res, next) => {
        // @ts-ignore
        req.neo4j = driver
        next()
    })

    app.use(express.urlencoded({ extended: true }))
    app.use(express.json())

    app.set('view engine', 'pug')

    // Init bugsnag
    initBugsnag()

    // Pre-auth static routes
    app.use(express.static(path.join(__dirname, '..', 'public')))

    // Apply locals
    registerLocals(app)

    // Apply auth headers
    applyAuth(app)

    // Apply Session/Flash
    registerSession(app)

    // Bugsnag Request Handler
    useRequestHandler(app)

    // Routes
    app.use('/', homeRoutes)
    app.use('/account', accountRoutes)
    app.use('/categories', categoryRoutes)
    app.use('/courses', courseRoutes)
    app.use('/u', publicProfileRoutes)
    app.use('/browser', express.static( path.join(__dirname, '..', 'browser', 'dist') ))

    if ( process.env.NODE_ENV !== 'production' ) {
        app.use('/test', testRoutes)
    }

    // Bugsnag Error Handler
    useErrorHandler(app)

    // Generic 404 Error Handler
    apply404handler(app)

    return app
}
