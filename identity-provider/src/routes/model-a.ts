import * as express from 'express';
import * as joi from 'joi';

import * as utils from '../utils';
import * as api from '../api';
import * as types from '../types';
import { DB } from '../database';
import { ObjectId } from 'bson';

const log = require('debug')('app:model-a');

export const client = express.Router();
client
    .use(utils.auth(types.TokenType.Client))
    .post('/session', createSession)
    .get('/session/:sessionId', utils.validateParamId('sessionId'), querySession)

function createSession(req: express.Request, res: express.Response) {
    const account = req.account!;
    log(account._id);
    const data = req.body;

    const schema = joi.object().keys({
        types: joi.array().items(joi.string()).required()
    });

    const result = joi.validate<types.SessionParams>(data, schema);
    if (result.error)
        return res.status(400).json({
            status: 'error',
            message: 'Invalid request data',
            data: data
        });

    api.createSession(account._id, result.value.types).then(record => {
        res.send(record);
    })
}

function querySession(req: express.Request, res: express.Response) {
    const account = req.account!;

    const sessionId = new ObjectId(req.params['sessionId']);

    DB.getSession({ _id: sessionId, accountId: account._id }).then(record => {
        if (!record) return res.status(404).json({
            status: 'error',
            message: 'Could not find session',
        });

        res.send(record);
    });
}


export const user = express.Router();

user
    .use(utils.auth(types.TokenType.User))
    .get('/session/:sessionId', utils.validateParamId('sessionId'), sessionInfo)
    .post('/session/:sessionId/approve', utils.validateParamId('sessionId'), approveSession)
    .post('/session/:sessionId/reject', utils.validateParamId('sessionId'), rejectSession)


function sessionInfo(req: express.Request, res: express.Response) {
    const sessionId = new ObjectId(req.params['sessionId']);
    DB.getSession({ _id: sessionId }).then(record => {
        if (!record) return res.status(404).json({
            status: 'error',
            message: 'Could not find session',
        });
        res.send(record);
    });
}

function approveSession(req: express.Request, res: express.Response) {
    const account = req.account!;
    log(account._id);
    const sessionId = new ObjectId(req.params['sessionId']);
}

function rejectSession(req: express.Request, res: express.Response) {
    const account = req.account!;
    log(account._id);
    let sessionId: ObjectId
    try {
        sessionId = new ObjectId(req.params['sessionId'])
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid sessionId',
        });
    }
}



