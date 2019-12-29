(function () {
	'use strict';

	angular.module('WordcountApp', [])

	.controller('WordcountController', ['$scope', '$log', '$http', '$timeout', 
		function($scope, $log, $http, $timeout) {
			$scope.submitButtonText = 'Submit';
			$scope.loading = false;
			$scope.urlerror = false;

			$scope.getResults = function() {
				var userInput = $scope.url;

				$http.post('/start', {'url': userInput}).
					success(function(results) {
						$log.log(results);
						$scope.urlerror = false;
						$scope.loading = true;
						$scope.submitButtonText = 'Loading...';
						$scope.wordcounts = null;
						getWordCount(results);
					}).
					error(function(error) {
						$log.log(error);
					})
			};

			function getWordCount(jobId) {
				var timeout = '';

				var poller = function() {
					$http.get('/results/' + jobId).
						success(function(data, status, headers, config) {
							if (status === 202) {
								$log.log(data, status);
							} else if (status === 200) {
								$log.log(data);
								$scope.loading = false;
								$scope.submitButtonText = 'Submit';
								$scope.wordcounts = data;
								$timeout.cancel(timeout);
								return false;
							}
							timeout = $timeout(poller, 2000);
						}).
						error(function(error) {
							$log.log(error);
							$scope.loading = false;
							$scope.submitButtonText = 'Submit';
							$scope.urlerror = true;
						});
				};
				poller();
			}
		}
	])

	.directive('wordCountChart', ['$parse', function($parse) {
		return {
			restrict: 'E',
			replace: true,
			template: '<div id="chart"></div>',
			link: function(scope) {
				scope.$watch('wordcounts', function() {
					d3.select('#chart').selectAll('*').remove();
					var data = scope.wordcounts;
					for (var word in data) {
						d3.select('#chart')
							.append('div')
							.selectAll('div')
							.data(word[0])
							.enter()
							.append('div')
							.style('width', function() {
								return (data[word] * 20) + 'px';
							})
							.text(function(d) {
								return word;
							});
					}
				}, true)
			}
		};
	}]);
})();	
