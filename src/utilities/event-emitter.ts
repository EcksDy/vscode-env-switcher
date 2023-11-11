import EventEmitter from 'events';
import { registerInContainer } from './di-container';
import { EVENT_EMITTER } from './consts';

const eventEmitter = new EventEmitter();

registerInContainer([EVENT_EMITTER, { useValue: eventEmitter }]);
