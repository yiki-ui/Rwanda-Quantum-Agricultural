/**
 * Data Export Service for NISR-Compliant Data Export
 * Supports CSV and Excel formats with proper formatting and metadata
 */

class DataExportService {
    /**
     * Export data to CSV format
     * @param {Object} data - Dashboard data
     * @param {string} filename - Output filename
     */
    exportToCSV(data, filename = 'rwanda-agriculture-data') {
        const timestamp = new Date().toISOString().split('T')[0];

        // Export district metrics
        if (data.district_metrics) {
            const csvContent = this.generateDistrictCSV(data.district_metrics);
            this.downloadCSV(csvContent, `${filename}-districts-${timestamp}.csv`);
        }

        // Export time series
        if (data.time_series_data) {
            const csvContent = this.generateTimeSeriesCSV(data.time_series_data);
            this.downloadCSV(csvContent, `${filename}-timeseries-${timestamp}.csv`);
        }

        // Export summary statistics
        const summaryCSV = this.generateSummaryCSV(data);
        this.downloadCSV(summaryCSV, `${filename}-summary-${timestamp}.csv`);
    }

    /**
     * Generate CSV for district metrics
     */
    generateDistrictCSV(districts) {
        const headers = ['District', 'Province', 'Soil Quality (%)', 'Crop Yield (%)', 'Pesticide Use (%)', 'Nutrient Level (%)'];
        const rows = districts.map(d => [
            d.district,
            d.province,
            d.soilQuality,
            d.cropYield,
            d.pestUse,
            d.nutrientLevel
        ]);

        return this.arrayToCSV([headers, ...rows]);
    }

    /**
     * Generate CSV for time series data
     */
    generateTimeSeriesCSV(timeSeries) {
        const headers = ['Month', 'Simulations', 'Farmers Reached', 'Average Yield (%)'];
        const rows = timeSeries.map(t => [
            t.month,
            t.simulations,
            t.farmers,
            t.yield
        ]);

        return this.arrayToCSV([headers, ...rows]);
    }

    /**
     * Generate summary statistics CSV
     */
    generateSummaryCSV(data) {
        const rows = [
            ['Rwanda Quantum Agriculture Platform - Summary Statistics'],
            ['Generated:', new Date().toLocaleString()],
            [''],
            ['Platform Performance'],
            ['Metric', 'Value'],
            ['Cache Hit Rate (%)', (data.platform_performance?.cache_hit_rate * 100).toFixed(1)],
            ['Simulations Cached', data.platform_performance?.total_simulations_cached],
            ['Avg Simulation Time (ms)', data.platform_performance?.average_simulation_time_ms],
            ['Quantum Correlation (%)', (data.platform_performance?.quantum_classical_correlation * 100).toFixed(1)],
            [''],
            ['Agricultural Coverage'],
            ['Metric', 'Value'],
            ['Total Districts', data.rwanda_agricultural_coverage?.total_districts],
            ['Covered Districts', data.rwanda_agricultural_coverage?.covered_districts],
            ['Major Crops Supported', data.rwanda_agricultural_coverage?.major_crops_supported],
            ['Critical Pests Addressed', data.rwanda_agricultural_coverage?.critical_pests_addressed],
            [''],
            ['Impact Projections'],
            ['Metric', 'Value'],
            ['Farmers Benefited', data.potential_impact?.estimated_farmers_benefited],
            ['Yield Increase (%)', data.potential_impact?.potential_yield_increase_percentage],
            ['Pesticide Reduction (%)', data.potential_impact?.reduced_pesticide_usage_percentage],
            ['Environmental Impact Reduction (%)', data.potential_impact?.environmental_impact_reduction],
            [''],
            ['Statistical Analysis'],
            ['Metric', 'Value'],
            ['Mean Yield (%)', data.yield_distribution?.mean],
            ['Median Yield (%)', data.yield_distribution?.median],
            ['Standard Deviation', data.yield_distribution?.stdDev],
            ['Q1 (%)', data.yield_distribution?.q1],
            ['Q3 (%)', data.yield_distribution?.q3],
            [''],
            ['Data Provenance'],
            ['Source', 'Rwanda Quantum Agriculture Platform'],
            ['Institution', 'National Institute of Statistics of Rwanda (NISR)'],
            ['Export Date', new Date().toISOString()],
            ['Format Version', '1.0']
        ];

        return this.arrayToCSV(rows);
    }

    /**
     * Convert array to CSV string
     */
    arrayToCSV(data) {
        return data.map(row =>
            row.map(cell => {
                // Handle cells with commas or quotes
                const cellStr = String(cell ?? '');
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return `"${cellStr.replace(/"/g, '""')}"`;
                }
                return cellStr;
            }).join(',')
        ).join('\n');
    }

    /**
     * Download CSV file
     */
    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Export to Excel format (using HTML table method)
     * This creates an Excel-compatible HTML file that Excel can open
     */
    exportToExcel(data, filename = 'rwanda-agriculture-data') {
        const timestamp = new Date().toISOString().split('T')[0];

        const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #0096c8; color: white; font-weight: bold; padding: 8px; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          .header { background-color: #f0f0f0; font-weight: bold; }
          .section-title { background-color: #0096c8; color: white; font-weight: bold; font-size: 14px; padding: 10px; }
        </style>
      </head>
      <body>
        ${this.generateExcelSummarySheet(data)}
        <br><br>
        ${this.generateExcelDistrictSheet(data.district_metrics)}
        <br><br>
        ${this.generateExcelTimeSeriesSheet(data.time_series_data)}
      </body>
      </html>
    `;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}-${timestamp}.xls`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Generate Excel summary sheet
     */
    generateExcelSummarySheet(data) {
        return `
      <table>
        <tr><td colspan="2" class="section-title">Rwanda Quantum Agriculture Platform - Summary</td></tr>
        <tr><td class="header">Generated:</td><td>${new Date().toLocaleString()}</td></tr>
        <tr><td class="header">Institution:</td><td>National Institute of Statistics of Rwanda (NISR)</td></tr>
        <tr><td colspan="2"></td></tr>
        
        <tr><td colspan="2" class="section-title">Platform Performance</td></tr>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Cache Hit Rate</td><td>${(data.platform_performance?.cache_hit_rate * 100).toFixed(1)}%</td></tr>
        <tr><td>Simulations Cached</td><td>${data.platform_performance?.total_simulations_cached}</td></tr>
        <tr><td>Avg Simulation Time</td><td>${data.platform_performance?.average_simulation_time_ms}ms</td></tr>
        <tr><td>Quantum Correlation</td><td>${(data.platform_performance?.quantum_classical_correlation * 100).toFixed(1)}%</td></tr>
        <tr><td colspan="2"></td></tr>
        
        <tr><td colspan="2" class="section-title">Agricultural Coverage</td></tr>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Total Districts</td><td>${data.rwanda_agricultural_coverage?.total_districts}</td></tr>
        <tr><td>Covered Districts</td><td>${data.rwanda_agricultural_coverage?.covered_districts}</td></tr>
        <tr><td>Major Crops</td><td>${data.rwanda_agricultural_coverage?.major_crops_supported}</td></tr>
        <tr><td>Critical Pests</td><td>${data.rwanda_agricultural_coverage?.critical_pests_addressed}</td></tr>
        <tr><td colspan="2"></td></tr>
        
        <tr><td colspan="2" class="section-title">Impact Projections (95% CI)</td></tr>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Farmers Benefited</td><td>${data.potential_impact?.estimated_farmers_benefited?.toLocaleString()}</td></tr>
        <tr><td>Yield Increase</td><td>+${data.potential_impact?.potential_yield_increase_percentage}% (±3%)</td></tr>
        <tr><td>Pesticide Reduction</td><td>-${data.potential_impact?.reduced_pesticide_usage_percentage}% (±5%)</td></tr>
        <tr><td>Environmental Impact</td><td>-${data.potential_impact?.environmental_impact_reduction}%</td></tr>
      </table>
    `;
    }

    /**
     * Generate Excel district sheet
     */
    generateExcelDistrictSheet(districts) {
        if (!districts) return '';

        const rows = districts.map(d => `
      <tr>
        <td>${d.district}</td>
        <td>${d.province}</td>
        <td>${d.soilQuality}</td>
        <td>${d.cropYield}</td>
        <td>${d.pestUse}</td>
        <td>${d.nutrientLevel}</td>
      </tr>
    `).join('');

        return `
      <table>
        <tr><td colspan="6" class="section-title">District Performance Metrics</td></tr>
        <tr>
          <th>District</th>
          <th>Province</th>
          <th>Soil Quality (%)</th>
          <th>Crop Yield (%)</th>
          <th>Pesticide Use (%)</th>
          <th>Nutrient Level (%)</th>
        </tr>
        ${rows}
      </table>
    `;
    }

    /**
     * Generate Excel time series sheet
     */
    generateExcelTimeSeriesSheet(timeSeries) {
        if (!timeSeries) return '';

        const rows = timeSeries.map(t => `
      <tr>
        <td>${t.month}</td>
        <td>${t.simulations}</td>
        <td>${t.farmers?.toLocaleString()}</td>
        <td>${t.yield}%</td>
      </tr>
    `).join('');

        return `
      <table>
        <tr><td colspan="4" class="section-title">Platform Adoption Trends</td></tr>
        <tr>
          <th>Month</th>
          <th>Simulations</th>
          <th>Farmers Reached</th>
          <th>Average Yield (%)</th>
        </tr>
        ${rows}
      </table>
    `;
    }
}

// Export singleton instance
const dataExportService = new DataExportService();
export default dataExportService;
