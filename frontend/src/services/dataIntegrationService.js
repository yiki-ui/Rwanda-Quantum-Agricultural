/**
 * Data Integration Service for Rwanda Quantum Agriculture Analytics
 * Handles data import, validation, transformation, and quality checks
 * Supports CSV, JSON, and API data sources
 */

class DataIntegrationService {
    constructor() {
        this.validators = {
            district: this.validateDistrictData.bind(this),
            timeSeries: this.validateTimeSeriesData.bind(this),
            distribution: this.validateDistributionData.bind(this)
        };
    }

    /**
     * Import data from various sources
     * @param {File|string|Object} source - Data source (File, URL, or object)
     * @param {string} type - Data type ('csv', 'json', 'api')
     * @returns {Promise<Object>} Processed data
     */
    async importData(source, type = 'json') {
        try {
            let rawData;

            switch (type) {
                case 'csv':
                    rawData = await this.parseCSV(source);
                    break;
                case 'json':
                    rawData = await this.parseJSON(source);
                    break;
                case 'api':
                    rawData = await this.fetchFromAPI(source);
                    break;
                default:
                    throw new Error(`Unsupported data type: ${type}`);
            }

            // Validate and transform data
            const validatedData = this.validateData(rawData);
            const transformedData = this.transformData(validatedData);

            return {
                success: true,
                data: transformedData,
                metadata: this.generateMetadata(transformedData),
                quality: this.assessDataQuality(transformedData)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Parse CSV file or string
     */
    async parseCSV(source) {
        if (source instanceof File) {
            const text = await source.text();
            return this.csvToJSON(text);
        }
        return this.csvToJSON(source);
    }

    /**
     * Convert CSV text to JSON
     */
    csvToJSON(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            headers.forEach((header, index) => {
                row[header] = this.parseValue(values[index]);
            });
            data.push(row);
        }

        return data;
    }

    /**
     * Parse JSON file or object
     */
    async parseJSON(source) {
        if (source instanceof File) {
            const text = await source.text();
            return JSON.parse(text);
        }
        if (typeof source === 'string') {
            return JSON.parse(source);
        }
        return source;
    }

    /**
     * Fetch data from API endpoint
     */
    async fetchFromAPI(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        return await response.json();
    }

    /**
     * Parse value to appropriate type
     */
    parseValue(value) {
        // Try to parse as number
        const num = parseFloat(value);
        if (!isNaN(num)) return num;

        // Check for boolean
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;

        // Return as string
        return value;
    }

    /**
     * Validate data structure and content
     */
    validateData(data) {
        if (!Array.isArray(data) && typeof data !== 'object') {
            throw new Error('Data must be an array or object');
        }

        // Detect data type and validate accordingly
        if (this.isDistrictData(data)) {
            return this.validators.district(data);
        } else if (this.isTimeSeriesData(data)) {
            return this.validators.timeSeries(data);
        } else if (this.isDistributionData(data)) {
            return this.validators.distribution(data);
        }

        return data;
    }

    /**
     * Check if data is district metrics
     */
    isDistrictData(data) {
        if (!Array.isArray(data) || data.length === 0) return false;
        const sample = data[0];
        return sample.hasOwnProperty('district') || sample.hasOwnProperty('District');
    }

    /**
     * Check if data is time-series
     */
    isTimeSeriesData(data) {
        if (!Array.isArray(data) || data.length === 0) return false;
        const sample = data[0];
        return sample.hasOwnProperty('month') || sample.hasOwnProperty('date') || sample.hasOwnProperty('time');
    }

    /**
     * Check if data is distribution
     */
    isDistributionData(data) {
        return data.hasOwnProperty('bins') || data.hasOwnProperty('frequencies');
    }

    /**
     * Validate district data
     */
    validateDistrictData(data) {
        const requiredFields = ['district'];
        const numericFields = ['soilQuality', 'cropYield', 'pestUse', 'nutrientLevel'];

        return data.map(row => {
            // Check required fields
            requiredFields.forEach(field => {
                if (!row[field] && !row[field.charAt(0).toUpperCase() + field.slice(1)]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            });

            // Normalize field names
            const normalized = {
                district: row.district || row.District,
                province: row.province || row.Province || 'Unknown',
                soilQuality: this.normalizeValue(row.soilQuality || row.SoilQuality, 0, 100),
                cropYield: this.normalizeValue(row.cropYield || row.CropYield, 0, 100),
                pestUse: this.normalizeValue(row.pestUse || row.PestUse, 0, 100),
                nutrientLevel: this.normalizeValue(row.nutrientLevel || row.NutrientLevel, 0, 100)
            };

            return normalized;
        });
    }

    /**
     * Validate time-series data
     */
    validateTimeSeriesData(data) {
        return data.map(row => ({
            month: row.month || row.Month || row.date || row.Date,
            simulations: parseInt(row.simulations || row.Simulations || 0),
            farmers: parseInt(row.farmers || row.Farmers || 0),
            yield: parseFloat(row.yield || row.Yield || 0)
        }));
    }

    /**
     * Validate distribution data
     */
    validateDistributionData(data) {
        if (!data.bins || !data.frequencies) {
            throw new Error('Distribution data must have bins and frequencies');
        }

        return {
            bins: data.bins.map(b => parseFloat(b)),
            frequencies: data.frequencies.map(f => parseInt(f)),
            mean: parseFloat(data.mean || this.calculateMean(data)),
            median: parseFloat(data.median || this.calculateMedian(data)),
            stdDev: parseFloat(data.stdDev || this.calculateStdDev(data)),
            q1: parseFloat(data.q1 || 0),
            q3: parseFloat(data.q3 || 0)
        };
    }

    /**
     * Normalize numeric value to range
     */
    normalizeValue(value, min = 0, max = 100) {
        const num = parseFloat(value);
        if (isNaN(num)) return 0;
        return Math.max(min, Math.min(max, num));
    }

    /**
     * Transform data to match dashboard format
     */
    transformData(data) {
        // Data is already validated and normalized
        return data;
    }

    /**
     * Generate metadata about the dataset
     */
    generateMetadata(data) {
        return {
            recordCount: Array.isArray(data) ? data.length : Object.keys(data).length,
            importedAt: new Date().toISOString(),
            dataType: this.detectDataType(data),
            fields: this.extractFields(data)
        };
    }

    /**
     * Detect data type
     */
    detectDataType(data) {
        if (this.isDistrictData(data)) return 'district_metrics';
        if (this.isTimeSeriesData(data)) return 'time_series';
        if (this.isDistributionData(data)) return 'distribution';
        return 'unknown';
    }

    /**
     * Extract field names
     */
    extractFields(data) {
        if (Array.isArray(data) && data.length > 0) {
            return Object.keys(data[0]);
        }
        if (typeof data === 'object') {
            return Object.keys(data);
        }
        return [];
    }

    /**
     * Assess data quality
     */
    assessDataQuality(data) {
        const quality = {
            completeness: 0,
            accuracy: 0,
            consistency: 0,
            overall: 0,
            issues: []
        };

        if (Array.isArray(data)) {
            // Check completeness
            const totalFields = Object.keys(data[0] || {}).length;
            let completeRecords = 0;

            data.forEach(row => {
                const filledFields = Object.values(row).filter(v => v !== null && v !== undefined && v !== '').length;
                if (filledFields === totalFields) completeRecords++;
            });

            quality.completeness = (completeRecords / data.length) * 100;

            // Check for outliers (accuracy)
            const numericFields = Object.keys(data[0] || {}).filter(key =>
                typeof data[0][key] === 'number'
            );

            let outlierCount = 0;
            numericFields.forEach(field => {
                const values = data.map(row => row[field]).filter(v => !isNaN(v));
                const mean = values.reduce((a, b) => a + b, 0) / values.length;
                const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);

                values.forEach(v => {
                    if (Math.abs(v - mean) > 3 * stdDev) outlierCount++;
                });
            });

            quality.accuracy = Math.max(0, 100 - (outlierCount / data.length) * 100);

            // Consistency (check for duplicates)
            const uniqueKeys = new Set(data.map(row => JSON.stringify(row)));
            quality.consistency = (uniqueKeys.size / data.length) * 100;
        }

        quality.overall = (quality.completeness + quality.accuracy + quality.consistency) / 3;

        if (quality.completeness < 90) {
            quality.issues.push('Some records have missing data');
        }
        if (quality.accuracy < 90) {
            quality.issues.push('Potential outliers detected');
        }
        if (quality.consistency < 100) {
            quality.issues.push('Duplicate records found');
        }

        return quality;
    }

    /**
     * Calculate statistical measures
     */
    calculateMean(data) {
        if (!data.bins || !data.frequencies) return 0;
        const sum = data.bins.reduce((acc, bin, idx) => acc + bin * data.frequencies[idx], 0);
        const total = data.frequencies.reduce((a, b) => a + b, 0);
        return sum / total;
    }

    calculateMedian(data) {
        // Simplified median calculation
        return this.calculateMean(data);
    }

    calculateStdDev(data) {
        const mean = this.calculateMean(data);
        const variance = data.bins.reduce((acc, bin, idx) =>
            acc + Math.pow(bin - mean, 2) * data.frequencies[idx], 0
        ) / data.frequencies.reduce((a, b) => a + b, 0);
        return Math.sqrt(variance);
    }
}

// Export singleton instance
const dataIntegrationService = new DataIntegrationService();
export default dataIntegrationService;
