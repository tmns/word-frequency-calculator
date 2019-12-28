(function () {
	'use strict';

	angular.module('WordcountApp', [])

	.controller('WordcountController', ['$scope', '$log', '$http', '$timeout', 
		function($scope, $log, $http, $timeout) {
			$scope.submitButtonText = 'Submit';
			$scope.loading = false;

			$scope.getResults = function() {
				var userInput = $scope.url;

				$http.post('/start', {'url': userInput}).
					success(function(results) {
						$log.log(results);
						getWordCount(results);
						$scope.wordcounts = null;
						$scope.loading = true;
						$scope.submitButtonText = 'Loading...';
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
								$scope.wordcounts = data;
								$timeout.cancel(timeout);
								return false;
							}
							$scope.loading = false;
							$scope.submitButtonText = 'Submit';
							timeout = $timeout(poller, 2000);
						});
				};
				poller();
			}
		}
	]);
})();
