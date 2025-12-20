export interface FinancialMetrics {
    [key: string]: number | undefined;
    transportationAndTariffs?: number;
    incomeTax?: number;
    netProfit?: number;
    ebitda?: number;
    ebit?: number;
    profitBeforeTax?: number;
}

export interface TechMetrics {
    [tech: string]: number;
}

export interface RegionManufacturing {
    inHouse: TechMetrics;
    contract: TechMetrics;
    capacityUsage?: Record<string, number>;
    productionCost?: Record<string, number>;
    factories?: number;
    factoriesNext?: number;
}

export interface LogisticsData {
    [tech: string]: {
        inHouse: number;
        contract: number;
        imported: number;
        total: number;
        sales: number;
        exported: number;
        productionBuffer: number;
        unsatisfiedDemand: number;
    };
}

export interface MarginData {
    [tech: string]: {
        sales: number;
        variableCosts: number;
        grossProfit: number;
        margin: number;
        promotion: number;
    };
}

export interface TeamData {
    name: string;
    financials: {
        incomeStatement: {
            global: FinancialMetrics;
            usa: FinancialMetrics;
            asia: FinancialMetrics;
            europe: FinancialMetrics;
        };
        balanceSheet: {
            global: FinancialMetrics;
            usa: FinancialMetrics;
            asia: FinancialMetrics;
            europe: FinancialMetrics;
        };
        cashFlow: {
            global: FinancialMetrics;
            usa?: FinancialMetrics;
            asia?: FinancialMetrics;
            europe?: FinancialMetrics;
        };
        ratios: FinancialMetrics;
    };
    market: {
        global: FinancialMetrics;
        usa: FinancialMetrics;
        asia: FinancialMetrics;
        europe: FinancialMetrics;
    };
    manufacturing: {
        usa: RegionManufacturing;
        asia: RegionManufacturing;
    };
    logistics: {
        usa: LogisticsData;
        asia: LogisticsData;
        europe: LogisticsData;
    };
    costs: {
        usa: TechMetrics;
        asia: TechMetrics;
        europe: TechMetrics;
    };
    margins: {
        usa: MarginData;
        asia: MarginData;
        europe: MarginData;
    };
    // New Metrics for Comparison
    marketShare: {
        global: TechMetrics;
        usa: TechMetrics;
        asia: TechMetrics;
        europe: TechMetrics;
    };
    features: {
        usa: TechMetrics;
        asia: TechMetrics;
        europe: TechMetrics;
    };
    demand: {
        usa: TechMetrics;
        asia: TechMetrics;
        europe: TechMetrics;
    };
    prices: {
        usa: TechMetrics;
        asia: TechMetrics;
        europe: TechMetrics;
    };
    hr: {
        turnoverRate: number;
        staffingLevel: number;
        trainingCost: number;
        hiringOneOffCost: number;
        firingOneOffCost: number;
        efficiency: number;
        salary: number;
        trainingBudget: number;
        totalTurnover: number;
        availableWorkdays: number;
        allocatedWorkdays: number;
        totalCost: number;
    };
    marketingFocus: {
        usa: Record<string, string>; // tech -> strategy
        asia: Record<string, string>;
        europe: Record<string, string>;
    };
    // Legacy support for existing components until fully migrated
    metrics: {
        [category: string]: {
            [key: string]: number;
        };
    };
}

export interface RoundData {
    roundName: string;
    teams: TeamData[];
}
