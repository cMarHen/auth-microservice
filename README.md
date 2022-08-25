# auth-microservice
A basic authentication microservice written in Express with MongoDB

## Description

This is a basic auth-service written as part of a larger application developed in the cource 1DV026 - Server Side Programming @ Linneaus University.

The application is built in Express, and uses MongoDB as database. When saving user credentials to DB, passwords are hashed with ```bcrypt```. Emails are encrypted with the Node in-built ```crypto```.
