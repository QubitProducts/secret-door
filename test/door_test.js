define(function (require) {

  var $ = require('jquery');
  var sinon = require('sinon');
  var expect = require('expect');

  var Door = require('door');

  describe('door', function () {
    var door, childDoor, $iframe;

    beforeEach(function (done) {
      $iframe = $('<iframe></iframe>');
      $iframe
        .attr('src', 'base/test/setup/child.html')
        .load(function () {
          door = new Door({
            targetWindow: $iframe.get(0).contentWindow
          });
          (function ready() {
            if ($iframe[0].contentWindow.door) {
              childDoor = $iframe[0].contentWindow.door;
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
      door.destroy();
    });


    describe('execute', function () {

      var childHandler;

      beforeEach(function () {
        childHandler = sinon.stub();
        childDoor.setHandler('test', childHandler);
      });


      it('should call trigger on the child parents global door namespace', function () {
        return door.execute('test').then(function () {
          expect(childHandler.calledOnce).to.be.ok();
        });
      });

      it('should pass arguments', function () {
        return door.execute('test', 1, 2, 3).then(function () {
          expect(childHandler.calledWith(1, 2, 3)).to.be.ok();
        });
      });

    });


    describe('setHandler', function () {

      var callback;

      beforeEach(function () {
        callback = sinon.stub();

        door.setHandler('test', callback, {
          test: true
        });

        return childDoor.execute('test', 'testarg1', 'testarg2');
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
        return expect(door.setHandler.bind(null, 'test')).to.Throw;
      });

    });


    describe('promises that are returned in the handler', function () {

      beforeEach(function () {
        door.setHandler('test', function () {
          return new Promise(function (resolve) {
            resolve(45);
          });
        });
      });

      it('are resolved before responding', function () {
        return childDoor.execute('test').then(function (resp) {
          expect(resp).to.equal(45);
        });
      });

    });

    describe('tap', function () {
      var tap;
      beforeEach(function () {
        door.setHandler('test', function () {
          return 45;
        });
        childDoor.setHandler('url', function () {
          return "www";
        });
        tap = sinon.stub();
        door.tap(tap);
      });
      it('allows listening in on all communication going via this channel', function () {
        return childDoor.execute('test').then(function () {
          return door.execute('url');
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


    describe('destroy', function () {
      var callback;

      beforeEach(function () {
        callback = sinon.stub();
        door.setHandler('*', function () {});
        door.setHandler('test1', function () {});
        door.setHandler('test2', function () {});
      });

      it('should remove all callbacks', function () {
        door.destroy();
        expect(door.handlers).to.be.eql({});
      });

    });

  });
});