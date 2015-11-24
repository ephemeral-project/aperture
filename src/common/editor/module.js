angular.module('ep.common.editor', [])
  .directive('epEditor', function() {
    function configureModelLink(codeMirror, ngModel, scope) {
      if (!ngModel) return;

      ngModel.$formatters.push(function(value) {
        if (angular.isUndefined(value) || value === null) {
          return ''
        } else if (angular.isObject(value) || angular.isArray(value)) {
          throw new Error('ep.common.editor requires a string model')
        } else {
          return value;
        }
      })

      ngModel.$render = function() {
        codeMirror.setValue(ngModel.$viewValue || '')
      }

      codeMirror.on('change', function(instance) {
        var value = instance.getValue();
        if (value !== ngModel.$viewValue) {
          scope.$evalAsync(function() {
            ngModel.$setViewValue(value)
          })
        }
      })
    }

    return {
      restrict: 'E',
      require: '?ngModel',
      templateUrl: 'common/editor/editor.html',
      link: function postLink(scope, element, attrs, ngModel) {
        var codeMirrorOptions = angular.extend(
          {},
          scope.$eval(attrs.codemirrorOpts))

        element.html('')
        var codeMirror = new window.CodeMirror(function(elem) {
          element.append(elem);
        }, codeMirrorOptions)

        configureModelLink(codeMirror, ngModel, scope)
      }
    }
  })

