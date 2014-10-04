define(function (require) {

  var $ = require('jquery');
  var sinon = require('sinon');
  var expect = require('expect');

  var Door = require('door');
  // var DoorError = require('error');

  describe('door', function () {
    var channel1, channel2, childChannel1, childChannel2, $iframe;

    beforeEach(function (done) {
      $iframe = $('<iframe></iframe>');
      $iframe
        .attr('src', 'base/test/setup/child.html')
        .load(function () {
          channel1 = new Door({
            targetWindow: $iframe.get(0).contentWindow
          });
          channel2 = new Door({
            targetWindow: $iframe.get(0).contentWindow,
            namespace: 'differentNamespace'
          });
          (function ready() {
            if ($iframe[0].contentWindow.channel1) {
              childChannel1 = $iframe[0].contentWindow.channel1;
              childChannel2 = $iframe[0].contentWindow.channel2;
              done();
            } else {
              setTimeout(ready, 1);
            }
          })();
        })
        .appendTo($('body'));
    });

    afterEach(function () {
      $iframe.remove();
      $('body').empty();
      channel1.destroy();
      channel2.destroy();
    });


    describe('execute', function () {

      var childHandler;

      beforeEach(function () {
        childHandler = sinon.stub();
        childChannel1.setHandler('test', childHandler);
      });


      it('should call trigger on the child parents global door namespace', function () {
        return channel1.execute('test').then(function () {
          expect(childHandler.calledOnce).to.be.ok();
        });
      });

      it('should pass arguments', function () {
        return channel1.execute('test', 1, 2, 3).then(function () {
          expect(childHandler.calledWith(1, 2, 3)).to.be.ok();
        });
      });

    });

    describe('creating door with no options', function () {
      it('throws an error about a missing targetWindow', function () {
        try {
          return new Door();
        } catch (e) {
          expect(e.message).to.be('Please provide options.targetWindow (e.g. iframeEl.contentWindow or window.parent)');
        }
      });
    });


    describe('setHandler', function () {

      var callback;

      beforeEach(function () {
        callback = sinon.stub();

        channel1.setHandler('test', callback, {
          test: true
        });

        return childChannel1.execute('test', 'testarg1', 'testarg2');
      });


      it('calls the callback when event is triggered', function () {
        expect(callback.calledOnce).to.be.ok();
      });

      it('should pass on arguments', function () {
        expect(callback.calledWith('testarg1', 'testarg2')).to.be.ok();
      });

      it('should pass on context', function () {
        expect(callback.thisValues[0]).to.eql({
          test: true
        });
      });

      it('should handle multiple callbacks', function () {
        expect(callback.calledOnce).to.be.ok();
      });

      it('should not allow registering multiple handlers with the same name', function () {
        return expect(channel1.setHandler.bind(null, 'test')).to.Throw;
      });

    });


    describe('promises that are returned in the handler', function () {

      beforeEach(function () {
        channel1.setHandler('test', function () {
          return new Promise(function (resolve) {
            resolve(45);
          });
        });
      });

      it('are resolved before responding', function () {
        return childChannel1.execute('test').then(function (resp) {
          expect(resp).to.equal(45);
        });
      });

    });

    describe('tap', function () {
      var tap;
      beforeEach(function () {
        channel1.setHandler('test', function () {
          return 45;
        });
        childChannel1.setHandler('url', function () {
          return 'www';
        });
        tap = sinon.stub();
        channel1.tap(tap);
      });
      it('allows listening in on all communication going via this channel', function () {
        return childChannel1.execute('test').then(function () {
          return channel1.execute('url');
        }).then(function () {
          var arg1 = tap.args[0][0];
          delete arg1.id;
          expect(arg1).to.eql({
            type: 'request',
            data: [ 'test' ],
            namespace: 'door'
          });

          var arg2 = tap.args[1][0];
          delete arg2.id;
          expect(arg2).to.eql({
            type: 'response',
            data: 'www',
            success: true,
            namespace: 'door'
          });
        });
      });
    });

    describe('throwing handler', function () {
      beforeEach(function () {
        channel1.setHandler('test', function () {
          throw new Error('Something broke');
        });
      });

      it('responds with an error object', function () {
        return childChannel1.execute('test').catch(function (res) {
          expect(res.message).to.be('Something broke');
          expect(res instanceof $iframe.get(0).contentWindow.Error).to.be(true);
        });
      });
    });


    describe('handler returning failed promise', function () {
      beforeEach(function () {
        channel1.setHandler('test', function () {
          return Promise.reject(new Error('Something broke'));
        });
        childChannel1.setHandler('childTest', function () {
          return Promise.reject(new Error('Something broke in the child'));
        });
      });

      it('responds with an error object', function () {
        return childChannel1.execute('test').catch(function (res) {
          expect(res.message).to.be('Something broke');
          expect(res instanceof $iframe.get(0).contentWindow.Error).to.be(true);
        }).then(function () {
          return channel1.execute('childTest').catch(function (res) {
            expect(res.message).to.be('Something broke in the child');
            expect(res instanceof Error).to.be(true);
          });
        });
      });
    });


    describe('when handler is missing', function () {
      it('door returns a missing handler error', function () {
        return childChannel1.execute('test').catch(function (res) {
          expect(res.name).to.be('MissingHandler');
          expect(res.message).to.be("SecretDoor, namespace 'door', doesn't have a handler 'test'");
          expect(res instanceof $iframe.get(0).contentWindow.Error).to.be(true);
        });
      });
    });

    describe('invalid messages', function () {
      describe('messages in a different namespace', function () {
        it('are ignored', function () {
          var c1 = 0;
          var c2 = 0;
          channel1.tap(function () { c1++; });
          channel2.tap(function () { c2++; });
          return childChannel2.execute('foo').catch(function () {
            expect(c1).to.be(0);
            expect(c2).to.be(1);
          });
        });
      });
    });


    describe('cleaning up', function () {
      beforeEach(function () {
        channel1.setHandler('*', function () {});
        channel1.setHandler({
          test1: function () {},
          test2: function () {}
        });
      });

      describe('clearHandler', function () {
        it('should remove a handler', function () {
          expect(Object.keys(channel1.handlers)).to.be.eql(['*', 'test1', 'test2']);
          channel1.clearHandler('test1');
          expect(Object.keys(channel1.handlers)).to.be.eql(['*', 'test2']);
          channel1.clearHandler('*');
          expect(Object.keys(channel1.handlers)).to.be.eql(['test2']);
        });
      });

      describe('clearAllHandlers', function () {
        it('should remove all handlers', function () {
          expect(Object.keys(channel1.handlers)).to.be.eql(['*', 'test1', 'test2']);
          channel1.clearAllHandlers();
          expect(channel1.handlers).to.be.eql({});
        });
      });
    });


    describe('destroy', function () {

      beforeEach(function () {
        channel1.setHandler('*', function () {});
        channel1.setHandler({
          test1: function () {},
          test2: function () {}
        });
        sinon.spy(channel1, 'unbindEvents');
      });

      it('should remove all handlers and unbind events', function () {
        expect(Object.keys(channel1.handlers)).to.be.eql(['*', 'test1', 'test2']);
        channel1.destroy();
        expect(channel1.handlers).to.be.eql({});
        expect(channel1.unbindEvents.calledOnce).to.be(true);
      });
    });

  });
});