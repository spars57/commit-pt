import { setupCreators } from '#base';

export const { createCommand, createEvent, createResponder } = setupCreators();

setupCreators({
  commands: {
    /**
     * Register commands directly to the listed guilds to speed up development.
     * This makes commands available instantly in those guilds (avoids global propagation delays).
     */
    guilds: ['1410889841368891425', '1428811074089783479'], // Main guild | Test guild
  },
});
