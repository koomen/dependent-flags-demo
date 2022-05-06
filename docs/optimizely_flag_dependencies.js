import "https://unpkg.com/@optimizely/optimizely-sdk/dist/optimizely.browser.umd.min.js";

/**
 * Returns an Optimizely client instance with an additional bound method: decideWithDependencies
 * @param {Object} config  An configuration object
 */
function createInstance(config) {
	var optimizelyClient = optimizelySdk.createInstance(config);

	optimizelyClient.decideWithDependencies = decideWithDependencies.bind(optimizelyClient);

	return optimizelyClient;
};

/**
 * Makes a flag decision that respects any dependencies specified in the '_depends' flag variable
 * @param {Object} userContext  An OptimizelyUserContext object representing the user 
 * @param {String} flagKey      The flag key 
 * @param {Object} options      [Array of OptimizelyDecideOption enums]
 */
function decideWithDependencies(userContext, flagKey, options) {
	var config = this.getOptimizelyConfig();
	
	// Check dependencies
	if (config.featuresMap.hasOwnProperty(flagKey)) {

		var flag = config.featuresMap[flagKey];
		if (flag.variablesMap.hasOwnProperty("_depends")) {
			var dependencies = flag.variablesMap["_depends"].value.split(/[, ]+/);
			console.log(`Found dependencies for ${flagKey}: ${JSON.stringify(dependencies)}`);

			// Evaluate each dependency
			dependencies.forEach(dependency => {
				console.log(`Checking dependency: ${dependency}`);

				// If the dependency is not enabled, force the "off" variation to be returned
				if (userContext.decide(dependency, { DISABLE_DECISION_EVENT : true }).enabled) {
					console.log(`${flagKey} dependency ${dependency} is enabled`);
				} else {
					console.log(`${flagKey} dependency ${dependency} is disabled`);
					console.log(userContext.setForcedDecision({flagKey:flagKey}, {variationKey:"off"}));
				}
			});

		}
	}

	// Make the decision for flagKey
	// If flagKey has any disabled dependencies, decide() will return "off"
	var decision = userContext.decide(flagKey, options);

	// Remove the forced decision rule
	userContext.removeForcedDecision({flagKey: flagKey, ruleKey: null});

	return decision;
};

export { createInstance };

