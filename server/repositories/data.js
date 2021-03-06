function round(valueExpression, decimals) {
	let multiplier = Math.pow(10, decimals || 0);

	if (multiplier === 1) { // zero decimals
		return {
			$let: {
				vars: {
					valAdjusted: {
						$add: [
							valueExpression,
							{$cond: [{$gte: [valueExpression, 0]}, 0.5, -0.5]}
						]
					}
				},
				in: {
					$subtract: ['$$valAdjusted', {$mod: ['$$valAdjusted', 1]}]
				}
			}
		};
	}

	return {
		$let: {
			vars: {
				valAdjusted: {
					$add: [
						{$multiply: [valueExpression, multiplier]},
						{$cond: [{$gte: [valueExpression, 0]}, 0.5, -0.5]}
					]
				}
			},
			in: {
				$divide: [
					{$subtract: ['$$valAdjusted', {$mod: ['$$valAdjusted', 1]}]},
					multiplier
				]
			}
		}
	};
}


module.exports = class Data {
	constructor(db) {
		this.db = db;
	}

	async getAllPlatforms() {
		const pipeline = require('./pipelines/getAllPlatforms.pipeline.js');
		return await this.db.collection('items').aggregate(pipeline).toArray();
	}

	async getBrandsByFilter(platform, month, year) {
		const pipeline = require('./pipelines/getBrandsByFilter.pipeline.js')(platform, month, year);
		return await this.db.collection('items').aggregate(pipeline).toArray();
	}

	async getNamesByFilter(platform, month, year) {
		const pipeline = require('./pipelines/getNamesByFilter.pipeline.js')(platform, month, year);
		return await this.db.collection('items').aggregate(pipeline).toArray();
	}

	async getEverythingByBrandnames(brandNames, platform, month, year) {
		const pipeline = require('./pipelines/getEverythingByBrandnames.pipeline.js')(brandNames, platform, month, year);
		return await this.db.collection('items').aggregate(pipeline, {allowDiskUse: true}).toArray();
	}
};