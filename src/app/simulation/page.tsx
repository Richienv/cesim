'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart, Scatter, LabelList } from 'recharts';
import { AlertCircle, TrendingUp, DollarSign, Factory, Globe, ChevronDown, BarChart3, ArrowRightLeft, Truck, PieChart, Settings, Menu, Activity } from 'lucide-react';
import { clsx } from 'clsx';

// Types for our JSON data
interface MarketParameters {
    round_info: { current_round: string; description: string };
    market_prospects: {
        demand_forecast: { summary: string; growth_projections: Record<string, string>; tech_trends: Record<string, string> };
        cost_outlook: { summary: string; specifics: string };
        financial_outlook: { summary: string; implications: string };
    };
    parameters: {
        shipping_costs_usd: Record<string, number>;
        tariffs_usd: Record<string, number>;
        management_costs_usd: { fixed_per_round: Record<string, number>; basic_per_factory: Record<string, number> };
        finance: { interest_rates: any; corporate_tax_rate: Record<string, number>; capital_opportunity_cost: number; minimum_cash_usd: number };
        production: { investment_cost_k_usd: Record<string, number>; plant_delay_rounds: number; payment_delay_rounds: number; depreciation_rate: number; cost_per_feature_usd: number };
        exchange_rates: { rmb_to_usd: number; eur_to_usd: number };
    };
    detailed_parameters?: {
        shipping_costs: { route: string; this_round: number; last_round: number }[];
        tariffs: { route: string; this_round: number; last_round: number }[];
        tariffs_percentage: { route: string; this_round: number; last_round: number }[];
        fixed_management_costs: { region: string; this_round: number; last_round: number }[];
        basic_management_cost_per_factory: { region: string; this_round: number; last_round: number }[];
        variable_management_costs: { region: string; this_round: number; last_round: number }[];
        exchange_rates: { pair: string; this_round: number; last_round: number }[];
        finance: {
            par_value: { this_round: number; last_round: number };
            min_cash: { region: string; this_round: number; last_round: number }[];
            interest_rates: {
                long_term: { region: string; this_round: number; last_round: number };
                short_term: { region: string; this_round: number; last_round: number }[];
                cash: { region: string; this_round: number; last_round: number }[];
            };
            cost_of_capital: { this_round: number; last_round: number };
            corporate_tax: { region: string; this_round: number; last_round: number }[];
        };
        production: {
            plant_delay: { metric: string; this_round: number; last_round: number }[];
            investment_cost: { region: string; this_round: number; last_round: number }[];
            depreciation: { region: string; this_round: number; last_round: number }[];
            cost_per_feature: { region: string; this_round: number; last_round: number }[];
        };
    };
}

interface NetworkCoverage {
    description: string;
    regions: {
        usa: Record<string, number[]>;
        asia: Record<string, number[]>;
        europe: Record<string, number[]>;
    };
}

// Initial Data from Image
const INITIAL_DEMAND = {
    usa: 10840,
    asia: 18050,
    europe: 15650
};

const TECHNOLOGIES = ['Technology 1', 'Technology 2', 'Technology 3', 'Technology 4'];

const TEAMS = [
    { id: 'red', name: 'Red Team', color: 'bg-red-500' },
    { id: 'blue', name: 'Blue Team', color: 'bg-blue-500' },
    { id: 'green', name: 'Green Team', color: 'bg-green-500' },
    { id: 'yellow', name: 'Yellow Team', color: 'bg-yellow-500' },
    { id: 'pink', name: 'Pink Team', color: 'bg-pink-500' },
    { id: 'orange', name: 'Orange Team', color: 'bg-orange-500' },
];

interface TeamState {
    growth: { usa: number; asia: number; europe: number };
    decisions: {
        usa: { p1: { tech: string; share: number }; p2: { tech: string; share: number } };
        asia: { p1: { tech: string; share: number }; p2: { tech: string; share: number } };
        europe: { p1: { tech: string; share: number }; p2: { tech: string; share: number } };
        production: {
            usa: {
                line1: { tech: string; capacity: number };
                line2: { tech: string; capacity: number };
                outsourcing: { tech: string; amount: number };
                investment: number;
            };
            asia: {
                line1: { tech: string; capacity: number };
                line2: { tech: string; capacity: number };
                outsourcing: { tech: string; amount: number };
                investment: number;
            };
        };
        rnd: {
            [key: string]: { spend: number; features: string };
        };
        marketing: {
            usa: Record<string, { price: number; promo: number; features: number }>;
            asia: Record<string, { price: number; promo: number; features: number }>;
            europe: Record<string, { price: number; promo: number; features: number }>;
        };
        logistics: {
            usa: Record<string, string>;
            asia: Record<string, string>;
        };
        tax: {
            transferPrice: {
                usaToAsia: number;
                usaToEurope: number;
                asiaToUsa: number;
                asiaToEurope: number;
            };
        };
        finance: {
            longTermLoans: number;
            issueShares: number;
            buybackShares: number;
            dividend: number;
            internalLoans: {
                usaToAsia: number;
                usaToEurope: number;
            };
        };
    };
}

const INITIAL_TEAM_STATE: TeamState = {
    growth: { usa: 0, asia: 0, europe: 0 },
    decisions: {
        usa: { p1: { tech: 'Technology 1', share: 10 }, p2: { tech: 'Technology 2', share: 0 } },
        asia: { p1: { tech: 'Technology 1', share: 10 }, p2: { tech: 'Technology 2', share: 0 } },
        europe: { p1: { tech: 'Technology 1', share: 10 }, p2: { tech: 'Technology 2', share: 0 } },
        production: {
            usa: {
                line1: { tech: 'Technology 1', capacity: 81.0 },
                line2: { tech: 'Technology 1', capacity: 0 },
                outsourcing: { tech: 'Technology 1', amount: 0 },
                investment: 0
            },
            asia: {
                line1: { tech: 'Technology 1', capacity: 0 },
                line2: { tech: 'Technology 1', capacity: 0 },
                outsourcing: { tech: 'Technology 1', amount: 0 },
                investment: 0
            }
        },
        rnd: {
            tech1: { spend: 0, features: 'Not purchased' },
            tech2: { spend: 0, features: 'Not purchased' },
            tech3: { spend: 0, features: 'Not purchased' },
            tech4: { spend: 0, features: 'Not purchased' }
        },
        marketing: {
            usa: {
                tech1: { price: 280, promo: 5580, features: 2 },
                tech2: { price: 0, promo: 0, features: 1 },
                tech3: { price: 0, promo: 0, features: 1 },
                tech4: { price: 0, promo: 0, features: 1 }
            },
            asia: {
                tech1: { price: 280, promo: 5580, features: 2 },
                tech2: { price: 0, promo: 0, features: 1 },
                tech3: { price: 0, promo: 0, features: 1 },
                tech4: { price: 0, promo: 0, features: 1 }
            },
            europe: {
                tech1: { price: 280, promo: 5580, features: 2 },
                tech2: { price: 0, promo: 0, features: 1 },
                tech3: { price: 0, promo: 0, features: 1 },
                tech4: { price: 0, promo: 0, features: 1 }
            }
        },
        logistics: {
            usa: {
                tech1: '1. United States, 2. Asia, 3. Europe',
                tech2: '1. United States, 2. Asia, 3. Europe',
                tech3: '1. United States, 2. Asia, 3. Europe',
                tech4: '1. United States, 2. Asia, 3. Europe'
            },
            asia: {
                tech1: '1. Asia, 2. United States, 3. Europe',
                tech2: '1. Asia, 2. United States, 3. Europe',
                tech3: '1. Asia, 2. United States, 3. Europe',
                tech4: '1. Asia, 2. United States, 3. Europe'
            }
        },
        tax: {
            transferPrice: {
                usaToAsia: 1.0,
                usaToEurope: 1.0,
                asiaToUsa: 1.0,
                asiaToEurope: 1.0
            }
        },
        finance: {
            longTermLoans: 0,
            issueShares: 0,
            buybackShares: 0,
            dividend: 0,
            internalLoans: {
                usaToAsia: 0,
                usaToEurope: 0
            }
        }
    }
};

const LOGISTICS_PRIORITIES = [
    '1. United States, 2. Asia, 3. Europe',
    '1. United States, 2. Europe, 3. Asia',
    '1. Asia, 2. United States, 3. Europe',
    '1. Europe, 2. United States, 3. Asia',
    '1. Asia, 2. Europe, 3. United States',
    '1. Europe, 2. Asia, 3. United States'
];

const SECTIONS = [
    { id: 'demand', label: 'Demand Forecast' },
    { id: 'production', label: 'Production' },
    { id: 'rnd', label: 'Research & Development' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'logistics', label: 'Logistics' },
    { id: 'tax', label: 'Tax' },
    { id: 'finance', label: 'Finance' },
];

export default function SimulationPage() {
    const [marketParams, setMarketParams] = useState<MarketParameters | null>(null);
    const [networkCoverage, setNetworkCoverage] = useState<NetworkCoverage | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Team Management
    const [selectedTeam, setSelectedTeam] = useState(TEAMS[0].id);
    const [teamStates, setTeamStates] = useState<Record<string, TeamState>>(() => {
        const initial: Record<string, TeamState> = {};
        TEAMS.forEach(team => {
            initial[team.id] = JSON.parse(JSON.stringify(INITIAL_TEAM_STATE));
        });
        return initial;
    });

    const [activeSection, setActiveSection] = useState('demand');
    const [productionTab, setProductionTab] = useState<'plan' | 'invest'>('plan');
    const [marketingRegion, setMarketingRegion] = useState<'usa' | 'asia' | 'europe'>('usa');

    const currentTeamState = teamStates[selectedTeam];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [paramsRes, coverageRes] = await Promise.all([
                    fetch('/data/market_parameters.json'),
                    fetch('/data/network_coverage.json')
                ]);
                const params = await paramsRes.json();
                const coverage = await coverageRes.json();
                setMarketParams(params);
                setNetworkCoverage(coverage);
            } catch (error) {
                console.error("Failed to load simulation data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleGrowthChange = (region: 'usa' | 'asia' | 'europe', value: string) => {
        const val = parseFloat(value) || 0;
        setTeamStates(prev => ({
            ...prev,
            [selectedTeam]: {
                ...prev[selectedTeam],
                growth: { ...prev[selectedTeam].growth, [region]: val }
            }
        }));
    };

    const handleDecisionChange = (region: 'usa' | 'asia' | 'europe', product: 'p1' | 'p2', field: 'tech' | 'share', value: string | number) => {
        setTeamStates(prev => ({
            ...prev,
            [selectedTeam]: {
                ...prev[selectedTeam],
                decisions: {
                    ...prev[selectedTeam].decisions,
                    [region]: {
                        ...prev[selectedTeam].decisions[region],
                        [product]: {
                            ...prev[selectedTeam].decisions[region][product],
                            [field]: value
                        }
                    }
                }
            }
        }));
    };

    const handleProductionChange = (region: 'usa' | 'asia', type: 'line1' | 'line2' | 'outsourcing' | 'investment', field: string, value: string | number) => {
        setTeamStates(prev => ({
            ...prev,
            [selectedTeam]: {
                ...prev[selectedTeam],
                decisions: {
                    ...prev[selectedTeam].decisions,
                    production: {
                        ...prev[selectedTeam].decisions.production,
                        [region]: {
                            ...prev[selectedTeam].decisions.production[region],
                            [type]: typeof prev[selectedTeam].decisions.production[region][type as 'line1'] === 'object'
                                ? { ...prev[selectedTeam].decisions.production[region][type as 'line1'], [field]: value }
                                : value
                        }
                    }
                }
            }
        }));
    };

    const handleRndChange = (tech: string, field: 'spend' | 'features', value: string | number) => {
        setTeamStates(prev => ({
            ...prev,
            [selectedTeam]: {
                ...prev[selectedTeam],
                decisions: {
                    ...prev[selectedTeam].decisions,
                    rnd: {
                        ...prev[selectedTeam].decisions.rnd,
                        [tech]: {
                            ...prev[selectedTeam].decisions.rnd[tech],
                            [field]: value
                        }
                    }
                }
            }
        }));
    };

    const handleMarketingChange = (region: 'usa' | 'asia' | 'europe', tech: string, field: 'price' | 'promo' | 'features', value: number) => {
        setTeamStates(prev => ({
            ...prev,
            [selectedTeam]: {
                ...prev[selectedTeam],
                decisions: {
                    ...prev[selectedTeam].decisions,
                    marketing: {
                        ...prev[selectedTeam].decisions.marketing,
                        [region]: {
                            ...prev[selectedTeam].decisions.marketing[region],
                            [tech]: {
                                ...prev[selectedTeam].decisions.marketing[region][tech],
                                [field]: value
                            }
                        }
                    }
                }
            }
        }));
    };

    const handleLogisticsChange = (region: 'usa' | 'asia', tech: string, value: string) => {
        setTeamStates(prev => ({
            ...prev,
            [selectedTeam]: {
                ...prev[selectedTeam],
                decisions: {
                    ...prev[selectedTeam].decisions,
                    logistics: {
                        ...prev[selectedTeam].decisions.logistics,
                        [region]: {
                            ...prev[selectedTeam].decisions.logistics[region],
                            [tech]: value
                        }
                    }
                }
            }
        }));
    };

    const handleTaxChange = (field: keyof TeamState['decisions']['tax']['transferPrice'], value: number) => {
        setTeamStates(prev => ({
            ...prev,
            [selectedTeam]: {
                ...prev[selectedTeam],
                decisions: {
                    ...prev[selectedTeam].decisions,
                    tax: {
                        ...prev[selectedTeam].decisions.tax,
                        transferPrice: {
                            ...prev[selectedTeam].decisions.tax.transferPrice,
                            [field]: value
                        }
                    }
                }
            }
        }));
    };

    const handleFinanceChange = (field: string, value: number | Record<string, number>) => {
        setTeamStates(prev => ({
            ...prev,
            [selectedTeam]: {
                ...prev[selectedTeam],
                decisions: {
                    ...prev[selectedTeam].decisions,
                    finance: {
                        ...prev[selectedTeam].decisions.finance,
                        [field]: typeof value === 'object'
                            ? { ...prev[selectedTeam].decisions.finance.internalLoans, ...value }
                            : value
                    }
                }
            }
        }));
    };

    // Calculations
    const getProjectedDemand = (region: 'usa' | 'asia' | 'europe') => {
        return INITIAL_DEMAND[region] * (1 + currentTeamState.growth[region] / 100);
    };

    const getProductVolume = (region: 'usa' | 'asia' | 'europe', share: number) => {
        return (getProjectedDemand(region) * share / 100);
    };

    const getLogisticsData = () => {
        const techs = ['tech1', 'tech2', 'tech3', 'tech4'];
        const regions = ['usa', 'asia', 'europe'] as const;

        // Initialize Data Structures
        const data: any = { usa: {}, asia: {}, europe: {} };
        techs.forEach(tech => {
            regions.forEach(r => {
                data[r][tech] = {
                    yield: 0, outsourcing: 0, imported: 0, totalProduct: 0,
                    sold: 0, exported: 0, buffer: 0, unmet: 0, demand: 0,
                    exportToAsia: 0, exportToEurope: 0, exportToUsa: 0,
                    importedFromUsa: 0, importedFromAsia: 0
                };
            });
        });

        const toTechKey = (t: string) => t.toLowerCase().replace('nology ', '');

        // 1. Get Production
        // USA
        const usaProd = currentTeamState.decisions.production.usa;
        if (usaProd.line1.tech) data.usa[toTechKey(usaProd.line1.tech)].yield += usaProd.line1.capacity;
        if (usaProd.line2.tech) data.usa[toTechKey(usaProd.line2.tech)].yield += usaProd.line2.capacity;
        if (usaProd.outsourcing.tech) data.usa[toTechKey(usaProd.outsourcing.tech)].outsourcing += usaProd.outsourcing.amount;

        // Asia
        const asiaProd = currentTeamState.decisions.production.asia;
        if (asiaProd.line1.tech) data.asia[toTechKey(asiaProd.line1.tech)].yield += asiaProd.line1.capacity;
        if (asiaProd.line2.tech) data.asia[toTechKey(asiaProd.line2.tech)].yield += asiaProd.line2.capacity;
        if (asiaProd.outsourcing.tech) data.asia[toTechKey(asiaProd.outsourcing.tech)].outsourcing += asiaProd.outsourcing.amount;

        // Total Product
        techs.forEach(tech => {
            data.usa[tech].totalProduct = data.usa[tech].yield + data.usa[tech].outsourcing;
            data.asia[tech].totalProduct = data.asia[tech].yield + data.asia[tech].outsourcing;
        });

        // 2. Get Demand
        regions.forEach(r => {
            const p1 = currentTeamState.decisions[r].p1;
            const p2 = currentTeamState.decisions[r].p2;
            if (p1.tech) data[r][toTechKey(p1.tech)].demand += getProductVolume(r, p1.share);
            if (p2.tech) data[r][toTechKey(p2.tech)].demand += getProductVolume(r, p2.share);
        });

        // 3. Distribute Production
        const satisfiedDemand: any = { usa: {}, asia: {}, europe: {} };
        techs.forEach(t => { regions.forEach(r => satisfiedDemand[r][t] = 0); });

        // Distribute USA
        techs.forEach(tech => {
            const prod = data.usa[tech].totalProduct;
            let remaining = prod;
            const priorityStr = currentTeamState.decisions.logistics.usa[tech] || '1. United States, 2. Asia, 3. Europe';
            const priorityOrder = priorityStr.split(', ').map((s: string) => {
                if (s.includes('United States')) return 'usa';
                if (s.includes('Asia')) return 'asia';
                if (s.includes('Europe')) return 'europe';
                return 'usa';
            });

            priorityOrder.forEach((target: string) => {
                const needed = Math.max(0, data[target][tech].demand - satisfiedDemand[target][tech]);
                const shipped = Math.min(remaining, needed);

                if (target === 'usa') {
                    // Local sales
                } else {
                    data.usa[tech].exported += shipped;
                    if (target === 'asia') data.usa[tech].exportToAsia += shipped;
                    if (target === 'europe') data.usa[tech].exportToEurope += shipped;

                    data[target][tech].imported += shipped;
                    if (target === 'asia') data.asia[tech].importedFromUsa += shipped; // Wait, this is imported INTO Asia FROM USA
                    // data.asia[tech].importedFromUsa is correct.
                }
                satisfiedDemand[target][tech] += shipped;
                remaining -= shipped;
            });
            data.usa[tech].buffer = remaining;
        });

        // Distribute Asia
        techs.forEach(tech => {
            const prod = data.asia[tech].totalProduct;
            let remaining = prod;
            const priorityStr = currentTeamState.decisions.logistics.asia[tech] || '1. Asia, 2. United States, 3. Europe';
            const priorityOrder = priorityStr.split(', ').map((s: string) => {
                if (s.includes('United States')) return 'usa';
                if (s.includes('Asia')) return 'asia';
                if (s.includes('Europe')) return 'europe';
                return 'asia';
            });

            priorityOrder.forEach((target: string) => {
                const needed = Math.max(0, data[target][tech].demand - satisfiedDemand[target][tech]);
                const shipped = Math.min(remaining, needed);

                if (target === 'asia') {
                    // Local sales
                } else {
                    data.asia[tech].exported += shipped;
                    if (target === 'usa') data.asia[tech].exportToUsa += shipped;
                    if (target === 'europe') data.asia[tech].exportToEurope += shipped;

                    data[target][tech].imported += shipped;
                    if (target === 'usa') data.usa[tech].importedFromAsia += shipped;
                    // For Europe, imported from Asia
                    if (target === 'europe') data.europe[tech].importedFromAsia += shipped;
                }
                satisfiedDemand[target][tech] += shipped;
                remaining -= shipped;
            });
            data.asia[tech].buffer = remaining;
        });

        // Finalize Sales & Unmet
        regions.forEach(r => {
            techs.forEach(t => {
                data[r][t].sold = satisfiedDemand[r][t];
                data[r][t].unmet = Math.max(0, data[r][t].demand - data[r][t].sold);
            });
        });

        return data;
    };

    const logisticsData = getLogisticsData();

    const getTaxData = () => {
        const regions = ['usa', 'asia', 'europe'] as const;
        const taxRates = {
            usa: marketParams?.detailed_parameters?.finance.corporate_tax.find(t => t.region === 'USA')?.this_round || 35,
            asia: marketParams?.detailed_parameters?.finance.corporate_tax.find(t => t.region === 'Asia')?.this_round || 15,
            europe: marketParams?.detailed_parameters?.finance.corporate_tax.find(t => t.region === 'Europe')?.this_round || 31
        };

        const financials = {
            usa: { revenue: 0, cost: 0, taxable: 0, tax: 0, net: 0 },
            asia: { revenue: 0, cost: 0, taxable: 0, tax: 0, net: 0 },
            europe: { revenue: 0, cost: 0, taxable: 0, tax: 0, net: 0 }
        };

        // 1. Operational P&L (Simplified)
        ['tech1', 'tech2', 'tech3', 'tech4'].forEach(tech => {
            const techKey = tech as 'tech1' | 'tech2' | 'tech3' | 'tech4';

            // Base Unit Cost (Estimate)
            const features = currentTeamState.decisions.marketing.usa[techKey]?.features || 0;
            const unitCost = 100 + (features * 10);

            regions.forEach(region => {
                const sold = logisticsData[region][tech].sold;
                const price = currentTeamState.decisions.marketing[region][techKey].price;

                financials[region].revenue += sold * price;
                financials[region].cost += sold * unitCost;
            });

            // 2. Transfer Pricing Adjustments
            // USA -> Asia
            const usaToAsiaQty = logisticsData.usa[tech].exportToAsia;
            if (usaToAsiaQty > 0) {
                const tp = currentTeamState.decisions.tax.transferPrice.usaToAsia;
                const shift = (tp - 1) * unitCost * usaToAsiaQty;
                financials.usa.taxable += shift;
                financials.asia.taxable -= shift;
            }

            // USA -> Europe
            const usaToEuropeQty = logisticsData.usa[tech].exportToEurope;
            if (usaToEuropeQty > 0) {
                const tp = currentTeamState.decisions.tax.transferPrice.usaToEurope;
                const shift = (tp - 1) * unitCost * usaToEuropeQty;
                financials.usa.taxable += shift;
                financials.europe.taxable -= shift;
            }

            // Asia -> USA
            const asiaToUsaQty = logisticsData.asia[tech].exportToUsa;
            if (asiaToUsaQty > 0) {
                const tp = currentTeamState.decisions.tax.transferPrice.asiaToUsa;
                const shift = (tp - 1) * unitCost * asiaToUsaQty;
                financials.asia.taxable += shift;
                financials.usa.taxable -= shift;
            }

            // Asia -> Europe
            const asiaToEuropeQty = logisticsData.asia[tech].exportToEurope;
            if (asiaToEuropeQty > 0) {
                const tp = currentTeamState.decisions.tax.transferPrice.asiaToEurope;
                const shift = (tp - 1) * unitCost * asiaToEuropeQty;
                financials.asia.taxable += shift;
                financials.europe.taxable -= shift;
            }
        });

        // 3. Calculate Final Taxable & Tax
        let globalTaxable = 0;
        let globalTax = 0;

        regions.forEach(r => {
            // Add operational profit to taxable
            financials[r].taxable += (financials[r].revenue - financials[r].cost);

            // Apply Tax
            if (financials[r].taxable > 0) {
                financials[r].tax = financials[r].taxable * (taxRates[r] / 100);
            } else {
                financials[r].tax = 0;
            }
            financials[r].net = financials[r].taxable - financials[r].tax;

            globalTaxable += financials[r].taxable;
            globalTax += financials[r].tax;
        });

        return { financials, taxRates, globalTaxable, globalTax };
    };

    const taxData = getTaxData();



    const getFinanceData = () => {
        // 1. Interest Rates
        const rates = {
            longTerm: marketParams?.detailed_parameters?.finance.interest_rates.long_term.this_round || 4.0,
            shortTerm: {
                usa: marketParams?.detailed_parameters?.finance.interest_rates.short_term.find(r => r.region === 'USA')?.this_round || 5.0,
                asia: marketParams?.detailed_parameters?.finance.interest_rates.short_term.find(r => r.region === 'Asia')?.this_round || 5.5,
                europe: marketParams?.detailed_parameters?.finance.interest_rates.short_term.find(r => r.region === 'Europe')?.this_round || 4.5
            }
        };

        // 2. Share Data
        const shares = {
            outstanding: 30000 + currentTeamState.decisions.finance.issueShares - currentTeamState.decisions.finance.buybackShares,
            price: 159.83 // Simplified for simulation
        };

        // 3. Cash Flow Components
        const ebitda = taxData.globalTaxable + 62976; // Adding back estimated depreciation/interest
        const taxPaid = taxData.globalTax;

        // Working Capital & Interest Assumptions (Hardcoded for simulation consistency)
        const workingCapitalChange = 11686 - 18180; // AR - AP
        const netFinancingCosts = -56350; // Interest paid

        // Investing
        const investment = (currentTeamState.decisions.production.usa.investment || 0) + (currentTeamState.decisions.production.asia.investment || 0);

        // Financing (Excluding ST Loans)
        const shareProceeds = (currentTeamState.decisions.finance.issueShares * shares.price / 1000) - (currentTeamState.decisions.finance.buybackShares * shares.price / 1000);
        const financingFlowExclST = currentTeamState.decisions.finance.longTermLoans + shareProceeds - currentTeamState.decisions.finance.dividend;

        // Cash Calculation
        const beginningCash = 172844;
        const netCashFlowBeforeST = ebitda + workingCapitalChange + netFinancingCosts - taxPaid - investment + financingFlowExclST;
        const preliminaryCash = beginningCash + netCashFlowBeforeST;

        const minCash = 2000;
        const stLoansNeeded = Math.max(0, minCash - preliminaryCash);

        const netCashFlow = netCashFlowBeforeST + stLoansNeeded;
        const endingCash = preliminaryCash + stLoansNeeded;
        const financingFlow = financingFlowExclST + stLoansNeeded;

        return {
            rates,
            shares,
            ebitda,
            taxPaid,
            investment,
            financingFlow,
            netCashFlow,
            beginningCash,
            endingCash,
            stLoansNeeded,
            workingCapitalChange,
            netFinancingCosts
        };
    };

    const financeData = getFinanceData();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="md:pl-[var(--sidebar-width)] transition-all duration-300">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
                    <div className="px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            >
                                <Menu size={24} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Simulation & Forecasting</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <p className="text-base font-medium text-gray-500 uppercase tracking-wider">{marketParams?.round_info.current_round}</p>
                                </div>
                            </div>
                        </div>
                        {/* Team Selector */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                <span className="text-base font-medium text-gray-400 uppercase tracking-wider">Team</span>
                                <div className="relative">
                                    <select
                                        value={selectedTeam}
                                        onChange={(e) => setSelectedTeam(e.target.value)}
                                        className="appearance-none bg-transparent text-gray-700 text-lg font-semibold pr-6 focus:outline-none cursor-pointer"
                                    >
                                        {TEAMS.map(team => (
                                            <option key={team.id} value={team.id}>{team.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                </div>
                                <div className={`w-2 h-2 rounded-full ${TEAMS.find(t => t.id === selectedTeam)?.color}`}></div>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <Globe className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Sub-Navigation */}
                    <div className="px-8 flex overflow-x-auto gap-6">
                        {SECTIONS.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={clsx(
                                    "pb-3 text-lg font-medium transition-all relative",
                                    activeSection === section.id
                                        ? "text-red-600"
                                        : "text-gray-500 hover:text-gray-800"
                                )}
                            >
                                {section.label}
                                {activeSection === section.id && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="p-6 lg:p-8 w-full">

                    {/* DEMAND FORECAST SECTION */}
                    {activeSection === 'demand' && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {/* LEFT COLUMN: DECISION INPUTS */}
                            <div className="space-y-8">

                                {/* 1. Demand Forecast */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                                        <div>
                                            <h2 className="font-bold text-gray-900 text-2xl">Total Market Demand</h2>
                                            <p className="text-base text-gray-400 mt-1">Forecast growth for the upcoming round</p>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <TrendingUp className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <div className="grid grid-cols-3 gap-6 mb-8">
                                            {(['usa', 'asia', 'europe'] as const).map(region => (
                                                <div key={region} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-red-100 transition-colors">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="text-base font-bold text-gray-500 uppercase tracking-wider">{region}</span>
                                                        <div className="text-base font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                                            {((getProjectedDemand(region) - INITIAL_DEMAND[region]) / INITIAL_DEMAND[region] * 100).toFixed(1)}%
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <div className="text-base text-gray-400 mb-1">Growth Assumption</div>
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-2xl font-bold text-gray-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all placeholder-gray-300"
                                                                    placeholder="0"
                                                                    value={currentTeamState.growth[region]}
                                                                    onChange={(e) => handleGrowthChange(region, e.target.value)}
                                                                />
                                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/50">
                                                            <div>
                                                                <div className="text-sm text-gray-400 uppercase tracking-wider mb-0.5">Prev.</div>
                                                                <div className="text-lg font-semibold text-gray-600">{INITIAL_DEMAND[region].toLocaleString()}</div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm text-gray-400 uppercase tracking-wider mb-0.5">Forecast</div>
                                                                <div className="text-lg font-bold text-gray-900">{getProjectedDemand(region).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={[
                                                    { name: 'USA', prev: INITIAL_DEMAND.usa, curr: getProjectedDemand('usa') },
                                                    { name: 'Asia', prev: INITIAL_DEMAND.asia, curr: getProjectedDemand('asia') },
                                                    { name: 'Europe', prev: INITIAL_DEMAND.europe, curr: getProjectedDemand('europe') },
                                                ]} barGap={8}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                    <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={10} />
                                                    <YAxis tick={{ fontSize: 13, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                        cursor={{ fill: '#f9fafb' }}
                                                    />
                                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
                                                    <Bar dataKey="prev" name="Previous Round" fill="#e5e7eb" radius={[4, 4, 4, 4]} barSize={32} />
                                                    <Bar dataKey="curr" name="Forecast" fill="#ef4444" radius={[4, 4, 4, 4]} barSize={32} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Market Share Forecast */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-gray-50">
                                        <h2 className="font-bold text-gray-900 text-2xl">Market Share Forecast</h2>
                                        <p className="text-base text-gray-400 mt-1">Estimate your share for each product in each region.</p>
                                    </div>
                                    <div className="p-8 space-y-8">
                                        {(['usa', 'asia', 'europe'] as const).map(region => (
                                            <div key={region} className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Globe className="w-4 h-4 text-gray-400" />
                                                    <h3 className="font-bold text-gray-900 uppercase text-base tracking-wider">{region}</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    {(['p1', 'p2'] as const).map((prod, idx) => (
                                                        <div key={prod} className="grid grid-cols-12 gap-4 items-center">
                                                            <div className="col-span-3 text-lg font-medium text-gray-700">Product {idx + 1}</div>
                                                            <div className="col-span-4">
                                                                <div className="relative">
                                                                    <select
                                                                        className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 text-base font-medium text-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                                                        value={currentTeamState.decisions[region][prod].tech}
                                                                        onChange={(e) => handleDecisionChange(region, prod, 'tech', e.target.value)}
                                                                    >
                                                                        {TECHNOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
                                                                    </select>
                                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                                                </div>
                                                            </div>
                                                            <div className="col-span-3">
                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base font-medium text-right focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                                                        value={currentTeamState.decisions[region][prod].share}
                                                                        onChange={(e) => handleDecisionChange(region, prod, 'share', parseFloat(e.target.value) || 0)}
                                                                    />
                                                                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">%</span>
                                                                </div>
                                                            </div>
                                                            <div className="col-span-2 text-right">
                                                                <span className="text-base font-bold text-gray-900">
                                                                    {getProductVolume(region, currentTeamState.decisions[region][prod].share).toFixed(0)}k
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: REFERENCE DATA */}
                            <div className="space-y-8">
                                {/* Market Prospects */}
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <TrendingUp className="w-5 h-5 text-red-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Market Prospects</h2>
                                    </div>
                                    <div className="space-y-6 text-lg">
                                        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <h4 className="font-bold text-gray-900 mb-2">Demand Forecast</h4>
                                            <p className="text-gray-500 leading-relaxed mb-4">{marketParams?.market_prospects.demand_forecast.summary}</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                {Object.entries(marketParams?.market_prospects.demand_forecast.growth_projections || {}).map(([region, growth]) => (
                                                    <div key={region} className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
                                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider block mb-1">{region}</span>
                                                        <span className="font-bold text-green-600">{growth}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <h4 className="font-bold text-gray-900 mb-2">Cost Outlook</h4>
                                            <p className="text-gray-500 leading-relaxed">{marketParams?.market_prospects.cost_outlook.specifics}</p>
                                        </div>
                                        <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <h4 className="font-bold text-gray-900 mb-2">Financial Outlook</h4>
                                            <p className="text-gray-500 leading-relaxed">{marketParams?.market_prospects.financial_outlook.summary}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Network Coverage */}
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <Globe className="w-5 h-5 text-red-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Network Coverage Prediction</h2>
                                    </div>
                                    <div className="space-y-8">
                                        {['usa', 'asia', 'europe'].map(region => (
                                            <div key={region} className="h-48">
                                                <h4 className="text-base font-bold text-gray-400 uppercase tracking-wider mb-4">{region}</h4>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart
                                                        data={networkCoverage?.regions[region as 'usa' | 'asia' | 'europe'].tech_1.map((_, i) => ({
                                                            round: i,
                                                            tech1: networkCoverage?.regions[region as 'usa' | 'asia' | 'europe'].tech_1[i],
                                                            tech2: networkCoverage?.regions[region as 'usa' | 'asia' | 'europe'].tech_2[i],
                                                            tech3: networkCoverage?.regions[region as 'usa' | 'asia' | 'europe'].tech_3[i],
                                                            tech4: networkCoverage?.regions[region as 'usa' | 'asia' | 'europe'].tech_4[i],
                                                        }))}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                        <XAxis dataKey="round" tick={{ fontSize: 13, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={10} />
                                                        <YAxis domain={[0, 100]} tick={{ fontSize: 13, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                                        <Tooltip
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                            cursor={{ stroke: '#e5e7eb' }}
                                                        />
                                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                                                        <Line type="monotone" dataKey="tech1" stroke="#ef4444" dot={false} strokeWidth={2} name="Tech 1" />
                                                        <Line type="monotone" dataKey="tech2" stroke="#f59e0b" dot={false} strokeWidth={2} name="Tech 2" />
                                                        <Line type="monotone" dataKey="tech3" stroke="#10b981" dot={false} strokeWidth={2} name="Tech 3" />
                                                        <Line type="monotone" dataKey="tech4" stroke="#3b82f6" dot={false} strokeWidth={2} name="Tech 4" />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Key Parameters */}
                                {/* Key Parameters */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <DollarSign className="w-5 h-5 text-red-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Key Parameters</h2>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-lg text-left">
                                            <thead className="bg-red-50 text-gray-700 font-bold">
                                                <tr>
                                                    <th className="p-4">Parameter</th>
                                                    <th className="p-4 text-right">This round</th>
                                                    <th className="p-4 text-right">Last round</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {/* Shipping Costs */}
                                                <tr className="bg-gray-50/50"><td colSpan={3} className="p-4 font-bold text-gray-900">Shipping cost per product, USD</td></tr>
                                                {marketParams?.detailed_parameters?.shipping_costs.map((item, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="p-4 text-gray-600">{item.route}</td>
                                                        <td className="p-4 text-right font-medium">{item.this_round.toFixed(1)}</td>
                                                        <td className="p-4 text-right text-gray-500">{item.last_round.toFixed(1)}</td>
                                                    </tr>
                                                ))}

                                                {/* Tariffs */}
                                                <tr className="bg-gray-50/50"><td colSpan={3} className="p-4 font-bold text-gray-900">Tariff per unit, USD</td></tr>
                                                {marketParams?.detailed_parameters?.tariffs.map((item, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="p-4 text-gray-600">{item.route}</td>
                                                        <td className="p-4 text-right font-medium">{item.this_round.toFixed(1)}</td>
                                                        <td className="p-4 text-right text-gray-500">{item.last_round.toFixed(1)}</td>
                                                    </tr>
                                                ))}

                                                {/* Tariffs Percentage */}
                                                <tr className="bg-gray-50/50"><td colSpan={3} className="p-4 font-bold text-gray-900">Tariff per unit, as a percentage of unit cost</td></tr>
                                                {marketParams?.detailed_parameters?.tariffs_percentage.map((item, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="p-4 text-gray-600">{item.route}</td>
                                                        <td className="p-4 text-right font-medium">{item.this_round.toFixed(1)}</td>
                                                        <td className="p-4 text-right text-gray-500">{item.last_round.toFixed(1)}</td>
                                                    </tr>
                                                ))}

                                                {/* Fixed Management Costs */}
                                                <tr className="bg-gray-50/50"><td colSpan={3} className="p-4 font-bold text-gray-900">Fixed management costs, thousands of USD</td></tr>
                                                {marketParams?.detailed_parameters?.fixed_management_costs.map((item, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="p-4 text-gray-600">{item.region}</td>
                                                        <td className="p-4 text-right font-medium">{item.this_round.toLocaleString()}</td>
                                                        <td className="p-4 text-right text-gray-500">{item.last_round.toLocaleString()}</td>
                                                    </tr>
                                                ))}

                                                {/* Basic Management Cost per Factory */}
                                                <tr className="bg-gray-50/50"><td colSpan={3} className="p-4 font-bold text-gray-900">Basic management cost per factory, thousands of USD</td></tr>
                                                {marketParams?.detailed_parameters?.basic_management_cost_per_factory.map((item, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="p-4 text-gray-600">{item.region}</td>
                                                        <td className="p-4 text-right font-medium">{item.this_round.toLocaleString()}</td>
                                                        <td className="p-4 text-right text-gray-500">{item.last_round.toLocaleString()}</td>
                                                    </tr>
                                                ))}

                                                {/* Variable Management Costs */}
                                                <tr className="bg-gray-50/50"><td colSpan={3} className="p-4 font-bold text-gray-900">Variable management costs as a percentage of revenue</td></tr>
                                                {marketParams?.detailed_parameters?.variable_management_costs.map((item, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="p-4 text-gray-600">{item.region}</td>
                                                        <td className="p-4 text-right font-medium">{item.this_round.toFixed(1)}</td>
                                                        <td className="p-4 text-right text-gray-500">{item.last_round.toFixed(1)}</td>
                                                    </tr>
                                                ))}

                                                {/* Exchange Rates */}
                                                <tr className="bg-gray-50/50"><td colSpan={3} className="p-4 font-bold text-gray-900">Exchange rate, USD</td></tr>
                                                {marketParams?.detailed_parameters?.exchange_rates.map((item, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="p-4 text-gray-600">{item.pair}</td>
                                                        <td className="p-4 text-right font-medium">{item.this_round.toFixed(4)}</td>
                                                        <td className="p-4 text-right text-gray-500">{item.last_round.toFixed(4)}</td>
                                                    </tr>
                                                ))}

                                                {/* Finance Section */}
                                                <tr className="bg-gray-50/50"><td colSpan={3} className="p-4 font-bold text-gray-900">Finance</td></tr>
                                                <tr className="hover:bg-gray-50/50">
                                                    <td className="p-4 text-gray-600">Par value per share, USD</td>
                                                    <td className="p-4 text-right font-medium">{marketParams?.detailed_parameters?.finance.par_value.this_round}</td>
                                                    <td className="p-4 text-right text-gray-500">{marketParams?.detailed_parameters?.finance.par_value.last_round}</td>
                                                </tr>
                                                {marketParams?.detailed_parameters?.finance.min_cash.map((item, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="p-4 text-gray-600">{item.region}</td>
                                                        <td className="p-4 text-right font-medium">{item.this_round.toLocaleString()}</td>
                                                        <td className="p-4 text-right text-gray-500">{item.last_round.toLocaleString()}</td>
                                                    </tr>
                                                ))}

                                                {/* Interest Rates */}
                                                <tr className="bg-gray-100/50"><td colSpan={3} className="p-4 font-bold text-gray-800 text-sm uppercase tracking-wider">Main debt interest rate, %</td></tr>
                                                <tr className="hover:bg-gray-50/50">
                                                    <td className="p-4 text-gray-600">{marketParams?.detailed_parameters?.finance.interest_rates.long_term.region}</td>
                                                    <td className="p-4 text-right font-medium">{marketParams?.detailed_parameters?.finance.interest_rates.long_term.this_round.toFixed(1)}</td>
                                                    <td className="p-4 text-right text-gray-500">{marketParams?.detailed_parameters?.finance.interest_rates.long_term.last_round.toFixed(1)}</td>
                                                </tr>

                                                <tr className="bg-gray-100/50"><td colSpan={3} className="p-4 font-bold text-gray-800 text-sm uppercase tracking-wider">Short-term loan interest rate, %</td></tr>
                                                {marketParams?.detailed_parameters?.finance.interest_rates.short_term.map((item, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="p-4 text-gray-600">{item.region}</td>
                                                        <td className="p-4 text-right font-medium">{item.this_round.toFixed(1)}</td>
                                                        <td className="p-4 text-right text-gray-500">{item.last_round.toFixed(1)}</td>
                                                    </tr>
                                                ))}

                                                <tr className="bg-gray-100/50"><td colSpan={3} className="p-4 font-bold text-gray-800 text-sm uppercase tracking-wider">Cash interest rate, %</td></tr>
                                                {marketParams?.detailed_parameters?.finance.interest_rates.cash.map((item, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="p-4 text-gray-600">{item.region}</td>
                                                        <td className="p-4 text-right font-medium">{item.this_round.toFixed(1)}</td>
                                                        <td className="p-4 text-right text-gray-500">{item.last_round.toFixed(1)}</td>
                                                    </tr>
                                                ))}

                                                <tr className="bg-gray-100/50"><td colSpan={3} className="p-4 font-bold text-gray-800 text-sm uppercase tracking-wider">Cost of capital, %</td></tr>
                                                <tr className="hover:bg-gray-50/50">
                                                    <td className="p-4 text-gray-600">Capital opportunity cost</td>
                                                    <td className="p-4 text-right font-medium">{marketParams?.detailed_parameters?.finance.cost_of_capital.this_round.toFixed(1)}</td>
                                                    <td className="p-4 text-right text-gray-500">{marketParams?.detailed_parameters?.finance.cost_of_capital.last_round.toFixed(1)}</td>
                                                </tr>

                                                <tr className="bg-gray-100/50"><td colSpan={3} className="p-4 font-bold text-gray-800 text-sm uppercase tracking-wider">Corporate income tax, %</td></tr>
                                                {marketParams?.detailed_parameters?.finance.corporate_tax.map((item, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="p-4 text-gray-600">{item.region}</td>
                                                        <td className="p-4 text-right font-medium">{item.this_round.toFixed(1)}</td>
                                                        <td className="p-4 text-right text-gray-500">{item.last_round.toFixed(1)}</td>
                                                    </tr>
                                                ))}

                                                {/* Production */}
                                                <tr className="bg-gray-50/50"><td colSpan={3} className="p-4 font-bold text-gray-900">Production plant delay, round</td></tr>
                                                {marketParams?.detailed_parameters?.production.plant_delay.map((item, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="p-4 text-gray-600">{item.metric}</td>
                                                        <td className="p-4 text-right font-medium">{item.this_round}</td>
                                                        <td className="p-4 text-right text-gray-500">{item.last_round}</td>
                                                    </tr>
                                                ))}

                                                <tr className="bg-gray-50/50"><td colSpan={3} className="p-4 font-bold text-gray-900">Factory investment cost, thousands of USD</td></tr>
                                                {marketParams?.detailed_parameters?.production.investment_cost.map((item, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="p-4 text-gray-600">{item.region}</td>
                                                        <td className="p-4 text-right font-medium">{item.this_round.toLocaleString()}</td>
                                                        <td className="p-4 text-right text-gray-500">{item.last_round.toLocaleString()}</td>
                                                    </tr>
                                                ))}

                                                <tr className="bg-gray-50/50"><td colSpan={3} className="p-4 font-bold text-gray-900">Depreciation (declining balance method), %</td></tr>
                                                {marketParams?.detailed_parameters?.production.depreciation.map((item, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="p-4 text-gray-600">{item.region}</td>
                                                        <td className="p-4 text-right font-medium">{item.this_round.toFixed(1)}</td>
                                                        <td className="p-4 text-right text-gray-500">{item.last_round.toFixed(1)}</td>
                                                    </tr>
                                                ))}

                                                <tr className="bg-gray-50/50"><td colSpan={3} className="p-4 font-bold text-gray-900">Cost per feature (per feature per unit), USD</td></tr>
                                                {marketParams?.detailed_parameters?.production.cost_per_feature.map((item, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="p-4 text-gray-600">{item.region}</td>
                                                        <td className="p-4 text-right font-medium">{item.this_round.toFixed(1)}</td>
                                                        <td className="p-4 text-right text-gray-500">{item.last_round.toFixed(1)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PRODUCTION SECTION */}
                    {/* PRODUCTION SECTION */}
                    {activeSection === 'production' && (
                        <div className="space-y-6">
                            {/* Production Tabs */}
                            <div className="flex gap-6 border-b border-gray-200">
                                <button
                                    onClick={() => setProductionTab('plan')}
                                    className={clsx(
                                        "pb-3 text-base font-medium transition-all relative",
                                        productionTab === 'plan' ? "text-red-600" : "text-gray-500 hover:text-gray-800"
                                    )}
                                >
                                    Production Plan
                                    {productionTab === 'plan' && (
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setProductionTab('invest')}
                                    className={clsx(
                                        "pb-3 text-base font-medium transition-all relative",
                                        productionTab === 'invest' ? "text-red-600" : "text-gray-500 hover:text-gray-800"
                                    )}
                                >
                                    Factory Investment
                                    {productionTab === 'invest' && (
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                                    )}
                                </button>
                            </div>

                            {productionTab === 'plan' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left Column: Production Plan Chart */}
                                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="font-bold text-gray-900 text-xl">Production plan, pieces</h3>
                                        </div>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={[
                                                        { name: 'Tech 1', self: 2640, outsourced: 400, gap: -1000 },
                                                        { name: 'Tech 2', self: 2640, outsourced: 0, gap: -500 },
                                                        { name: 'Tech 3', self: 0, outsourced: 0, gap: 0 },
                                                        { name: 'Tech 4', self: 0, outsourced: 0, gap: 0 },
                                                    ]}
                                                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                                    stackOffset="sign"
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                                    <Bar dataKey="self" name="Self-production" stackId="a" fill="#9333ea" radius={[4, 4, 0, 0]} barSize={30} />
                                                    <Bar dataKey="outsourced" name="Outsourced" stackId="a" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={30} />
                                                    <Bar dataKey="gap" name="Unmet Demand" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} barSize={30} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Right Column: Detailed Tables */}
                                    <div className="lg:col-span-2 space-y-8">
                                        {/* Self Production Table */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="px-6 py-4 border-b border-gray-50 bg-red-50/30">
                                                <h3 className="font-bold text-red-700 text-xl">Self-production</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-base text-left">
                                                    <thead>
                                                        <tr className="bg-red-50 text-gray-700 font-bold border-b border-red-100">
                                                            <th className="p-4 w-1/4"></th>
                                                            <th className="p-4 text-center border-r border-red-100" colSpan={2}>USA</th>
                                                            <th className="p-4 text-center" colSpan={2}>Asia</th>
                                                        </tr>
                                                        <tr className="bg-gray-50 border-b border-gray-100 text-sm uppercase tracking-wider text-gray-500">
                                                            <th className="p-3"></th>
                                                            <th className="p-3 text-center w-1/5">Production Line 1</th>
                                                            <th className="p-3 text-center w-1/5 border-r border-gray-100">Production Line 2</th>
                                                            <th className="p-3 text-center w-1/5">Production Line 1</th>
                                                            <th className="p-3 text-center w-1/5">Production Line 2</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        <tr>
                                                            <td className="p-4 font-medium text-gray-700">Technology</td>
                                                            {(['usa', 'asia'] as const).map(region =>
                                                                (['line1', 'line2'] as const).map(line => (
                                                                    <td key={`${region}-${line}`} className={`p-2 ${line === 'line2' && region === 'usa' ? 'border-r border-gray-50' : ''}`}>
                                                                        <select
                                                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-base focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                                                            value={currentTeamState.decisions.production[region][line].tech}
                                                                            onChange={(e) => handleProductionChange(region, line, 'tech', e.target.value)}
                                                                        >
                                                                            {TECHNOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
                                                                        </select>
                                                                    </td>
                                                                ))
                                                            )}
                                                        </tr>
                                                        <tr>
                                                            <td className="p-4 font-medium text-gray-700">Capacity allocation, %</td>
                                                            {(['usa', 'asia'] as const).map(region =>
                                                                (['line1', 'line2'] as const).map(line => (
                                                                    <td key={`${region}-${line}`} className={`p-2 ${line === 'line2' && region === 'usa' ? 'border-r border-gray-50' : ''}`}>
                                                                        <input
                                                                            type="number"
                                                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-base text-right focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                                                            value={currentTeamState.decisions.production[region][line].capacity}
                                                                            onChange={(e) => handleProductionChange(region, line, 'capacity', parseFloat(e.target.value) || 0)}
                                                                        />
                                                                    </td>
                                                                ))
                                                            )}
                                                        </tr>
                                                        <tr>
                                                            <td className="p-4 text-gray-500">Unit production cost, USD</td>
                                                            <td className="p-4 text-center text-gray-400">N/A</td>
                                                            <td className="p-4 text-center text-gray-400 border-r border-gray-50">N/A</td>
                                                            <td className="p-4 text-center text-gray-400"></td>
                                                            <td className="p-4 text-center text-gray-400"></td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-4 text-gray-500">Scrap rate, %</td>
                                                            <td className="p-4 text-center text-gray-900">1.92</td>
                                                            <td className="p-4 text-center text-gray-900 border-r border-gray-50">4.38</td>
                                                            <td className="p-4 text-center text-gray-400"></td>
                                                            <td className="p-4 text-center text-gray-400"></td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-4 text-gray-500">Projected demand: 1,000 units</td>
                                                            <td className="p-4 text-center text-gray-900">0</td>
                                                            <td className="p-4 text-center text-gray-900 border-r border-gray-50">0</td>
                                                            <td className="p-4 text-center text-gray-900">0</td>
                                                            <td className="p-4 text-center text-gray-900">0</td>
                                                        </tr>
                                                        <tr className="bg-gray-50/30">
                                                            <td className="p-4 font-medium text-gray-900">Estimated production volume</td>
                                                            <td className="p-4 text-center font-bold text-gray-900">2,640</td>
                                                            <td className="p-4 text-center font-bold text-gray-900 border-r border-gray-50">2,640</td>
                                                            <td className="p-4 text-center font-bold text-gray-900">0</td>
                                                            <td className="p-4 text-center font-bold text-gray-900">0</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Production Capacity Summary */}
                                            <div className="border-t border-gray-200">
                                                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                                                    <h4 className="font-bold text-gray-800">Production capacity</h4>
                                                </div>
                                                <table className="w-full text-base text-left">
                                                    <thead>
                                                        <tr className="bg-red-50/50 text-gray-700 font-bold border-b border-red-50">
                                                            <th className="p-4 w-1/4"></th>
                                                            <th className="p-4 text-center w-1/3">USA</th>
                                                            <th className="p-4 text-center w-1/3">Asia</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        <tr>
                                                            <td className="p-4 text-gray-600">Production capacity, thousands of pieces</td>
                                                            <td className="p-4 text-center font-medium">6,600</td>
                                                            <td className="p-4 text-center font-medium">0</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-4 text-gray-600">Capacity utilization rate, %</td>
                                                            <td className="p-4 text-center font-medium">80.0</td>
                                                            <td className="p-4 text-center font-medium">0.0</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Outsourcing Production Table */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="px-6 py-4 border-b border-gray-50 bg-red-50/30 flex justify-between items-center">
                                                <h3 className="font-bold text-red-700 text-xl">Outsourcing production</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-base text-left">
                                                    <thead>
                                                        <tr className="bg-red-50 text-gray-700 font-bold border-b border-red-100">
                                                            <th className="p-4 w-1/4"></th>
                                                            <th className="p-4 text-center border-r border-red-100" colSpan={2}>USA</th>
                                                            <th className="p-4 text-center" colSpan={2}>Asia</th>
                                                        </tr>
                                                        <tr className="bg-gray-50 border-b border-gray-100 text-sm uppercase tracking-wider text-gray-500">
                                                            <th className="p-3">technology</th>
                                                            <th className="p-3 text-center w-1/5">Technology 1</th>
                                                            <th className="p-3 text-center w-1/5 border-r border-gray-100">Technology 2</th>
                                                            <th className="p-3 text-center w-1/5">Technology 1</th>
                                                            <th className="p-3 text-center w-1/5">Technology 2</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        <tr>
                                                            <td className="p-4 font-medium text-gray-700">Planned outsourcing volume: 1,000 pieces</td>
                                                            <td className="p-2">
                                                                <input type="number" className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-base text-right" defaultValue={400} />
                                                            </td>
                                                            <td className="p-2 border-r border-gray-50">
                                                                <input type="number" className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-base text-right" defaultValue={0} />
                                                            </td>
                                                            <td className="p-2">
                                                                <input type="number" className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-base text-right" defaultValue={0} />
                                                            </td>
                                                            <td className="p-2">
                                                                <input type="number" className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-base text-right" defaultValue={0} />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-4 text-gray-500">Unit production cost, USD</td>
                                                            <td className="p-4 text-center text-gray-900">111.4</td>
                                                            <td className="p-4 text-center text-gray-900 border-r border-gray-50">137.2</td>
                                                            <td className="p-4 text-center text-gray-900">145.5</td>
                                                            <td className="p-4 text-center text-gray-900">188.2</td>
                                                        </tr>
                                                        <tr className="bg-gray-50/30">
                                                            <td className="p-4 font-medium text-gray-900">Maximum total quantity, thousands of pieces</td>
                                                            <td className="p-4 text-center font-bold text-gray-900 border-r border-gray-50" colSpan={2}>1,000</td>
                                                            <td className="p-4 text-center font-bold text-gray-900" colSpan={2}>1,000</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {productionTab === 'invest' && (
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                    {/* LEFT COLUMN: Capacity Overview Chart */}
                                    <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-xl">Capacity Overview</h3>
                                                <p className="text-base text-gray-400 mt-1">Sales vs. Capacity trends</p>
                                            </div>
                                            <div className="p-2 bg-red-50 rounded-lg">
                                                <BarChart3 className="w-5 h-5 text-red-600" />
                                            </div>
                                        </div>
                                        <div className="p-6 h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={[
                                                    { name: 'Last Round', sales: 4454, capacity: 6600 },
                                                    { name: 'This Round', sales: 0, capacity: 6600 },
                                                    { name: 'Next Round', sales: 0, capacity: 6600 },
                                                    { name: 'Round 3', sales: 0, capacity: 6600 },
                                                ]} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barGap={2}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                    <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={10} />
                                                    <YAxis tick={{ fontSize: 13, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                        cursor={{ fill: '#f9fafb' }}
                                                    />
                                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
                                                    <Bar dataKey="sales" name="Sales" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
                                                    <Bar dataKey="capacity" name="Capacity" fill="#e5e7eb" radius={[4, 4, 0, 0]} barSize={20} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* RIGHT COLUMN: Tables */}
                                    <div className="xl:col-span-2 space-y-8">

                                        {/* Demand Forecast Table */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-xl">Demand Forecast</h3>
                                                    <p className="text-base text-gray-400 mt-1">Projected demand in thousands of units</p>
                                                </div>
                                                <div className="p-2 bg-red-50 rounded-lg">
                                                    <TrendingUp className="w-5 h-5 text-red-600" />
                                                </div>
                                            </div>
                                            <div className="p-8">
                                                <table className="w-full text-base">
                                                    <thead>
                                                        <tr className="border-b border-gray-100">
                                                            <th className="p-4 text-left text-base font-bold text-gray-400 uppercase tracking-wider">Technology</th>
                                                            <th className="p-4 text-right text-base font-bold text-gray-400 uppercase tracking-wider">Last Round</th>
                                                            <th className="p-4 text-right text-base font-bold text-gray-400 uppercase tracking-wider">This Round</th>
                                                            <th className="p-4 text-right text-base font-bold text-gray-400 uppercase tracking-wider">Next Round</th>
                                                            <th className="p-4 text-right text-base font-bold text-gray-400 uppercase tracking-wider">Round 3</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {['Technology 1', 'Technology 2', 'Technology 3', 'Technology 4'].map((tech, idx) => (
                                                            <tr key={tech} className="hover:bg-gray-50/50 transition-colors">
                                                                <td className="p-4 font-medium text-gray-700">{tech}</td>
                                                                <td className="p-4 text-right text-gray-500">{idx === 0 ? '4 454' : '-'}</td>
                                                                <td className="p-4 text-right text-gray-500">-</td>
                                                                <td className="p-4 text-right">
                                                                    <input
                                                                        type="number"
                                                                        className="w-24 text-right bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-base font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                                                        defaultValue={0}
                                                                    />
                                                                </td>
                                                                <td className="p-4 text-right">
                                                                    <input
                                                                        type="number"
                                                                        className="w-24 text-right bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-base font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                                                        defaultValue={0}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr className="bg-gray-50/50">
                                                            <td className="p-4 font-bold text-gray-900">Total</td>
                                                            <td className="p-4 text-right font-bold text-gray-900">4 454</td>
                                                            <td className="p-4 text-right font-bold text-gray-900">-</td>
                                                            <td className="p-4 text-right font-bold text-gray-900">0</td>
                                                            <td className="p-4 text-right font-bold text-gray-900">0</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Production Parameters */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
                                                <div className="p-2 bg-red-50 rounded-lg">
                                                    <Settings className="w-5 h-5 text-red-600" />
                                                </div>
                                                <h3 className="font-bold text-gray-900 text-xl">Production Parameters</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-base text-left">
                                                    <thead className="bg-red-50 text-gray-700 font-bold">
                                                        <tr>
                                                            <th className="p-4">Parameter</th>
                                                            <th className="p-4 text-right">This round</th>
                                                            <th className="p-4 text-right">Last round</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {/* Plant Delay */}
                                                        <tr className="bg-gray-50/50"><td colSpan={3} className="p-4 font-bold text-gray-900">Plant delay</td></tr>
                                                        {marketParams?.detailed_parameters?.production?.plant_delay.map((item, i) => (
                                                            <tr key={i} className="hover:bg-gray-50/50">
                                                                <td className="p-4 text-gray-600">{item.metric}</td>
                                                                <td className="p-4 text-right font-medium">{item.this_round}</td>
                                                                <td className="p-4 text-right text-gray-500">{item.last_round}</td>
                                                            </tr>
                                                        ))}

                                                        {/* Investment Cost */}
                                                        <tr className="bg-gray-50/50"><td colSpan={3} className="p-4 font-bold text-gray-900">Investment cost, USD</td></tr>
                                                        {marketParams?.detailed_parameters?.production?.investment_cost.map((item, i) => (
                                                            <tr key={i} className="hover:bg-gray-50/50">
                                                                <td className="p-4 text-gray-600">{item.region}</td>
                                                                <td className="p-4 text-right font-medium">{item.this_round.toLocaleString()}</td>
                                                                <td className="p-4 text-right text-gray-500">{item.last_round.toLocaleString()}</td>
                                                            </tr>
                                                        ))}

                                                        {/* Depreciation */}
                                                        <tr className="bg-gray-50/50"><td colSpan={3} className="p-4 font-bold text-gray-900">Depreciation, %</td></tr>
                                                        {marketParams?.detailed_parameters?.production?.depreciation.map((item, i) => (
                                                            <tr key={i} className="hover:bg-gray-50/50">
                                                                <td className="p-4 text-gray-600">{item.region}</td>
                                                                <td className="p-4 text-right font-medium">{item.this_round.toFixed(1)}</td>
                                                                <td className="p-4 text-right text-gray-500">{item.last_round.toFixed(1)}</td>
                                                            </tr>
                                                        ))}

                                                        {/* Cost per feature */}
                                                        <tr className="bg-gray-50/50"><td colSpan={3} className="p-4 font-bold text-gray-900">Cost per feature, USD</td></tr>
                                                        {marketParams?.detailed_parameters?.production?.cost_per_feature.map((item, i) => (
                                                            <tr key={i} className="hover:bg-gray-50/50">
                                                                <td className="p-4 text-gray-600">{item.region}</td>
                                                                <td className="p-4 text-right font-medium">{item.this_round.toFixed(1)}</td>
                                                                <td className="p-4 text-right text-gray-500">{item.last_round.toFixed(1)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Investment Decision */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
                                                <div className="p-2 bg-red-50 rounded-lg">
                                                    <Factory className="w-5 h-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-xl">Factory Investment</h3>
                                                    <p className="text-base text-gray-400 mt-1">Manage capacity expansion</p>
                                                </div>
                                            </div>
                                            <div className="p-8">
                                                <table className="w-full text-base">
                                                    <thead>
                                                        <tr className="border-b border-gray-100">
                                                            <th className="p-4 text-left text-sm font-bold text-gray-400 uppercase tracking-wider w-1/3">Metric</th>
                                                            <th className="p-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wider bg-gray-50/50 rounded-t-lg">USA</th>
                                                            <th className="p-4 text-center text-base font-bold text-gray-900 uppercase tracking-wider bg-gray-50/50 rounded-t-lg border-l border-white">Asia</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        <tr>
                                                            <td className="p-4 font-medium text-gray-700">Current capacity (units)</td>
                                                            <td className="p-4 text-center text-gray-900 font-medium">550</td>
                                                            <td className="p-4 text-center text-gray-900 font-medium">550</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-4 font-medium text-gray-700">
                                                                Investment
                                                                <span className="ml-1 text-gray-400 text-sm">k USD</span>
                                                            </td>
                                                            {(['usa', 'asia'] as const).map(region => (
                                                                <td key={region} className="p-4">
                                                                    <input
                                                                        type="number"
                                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base font-medium text-right focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                                                        value={currentTeamState.decisions.production[region].investment}
                                                                        onChange={(e) => handleProductionChange(region, 'investment', 'investment', parseFloat(e.target.value) || 0)}
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* R&D SECTION */}
                    {activeSection === 'rnd' && (
                        <div className="space-y-8">
                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* R&D Progress Chart */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="font-bold text-gray-900 mb-4 text-center text-xl">R&D Progress (%)</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                { name: 'Tech 1', current: 100, next: 0 },
                                                { name: 'Tech 2', current: 0, next: 0 },
                                                { name: 'Tech 3', current: 0, next: 0 },
                                                { name: 'Tech 4', current: 0, next: 0 },
                                            ]} barGap={8}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={10} />
                                                <YAxis domain={[0, 100]} tick={{ fontSize: 13, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    cursor={{ fill: '#f9fafb' }}
                                                />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
                                                <Bar dataKey="current" name="This Round" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={32} />
                                                <Bar dataKey="next" name="Next Round" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* R&D Features Chart */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="font-bold text-gray-900 mb-4 text-center text-xl">R&D Features</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                { name: 'Tech 1', current: 2, next: 0 },
                                                { name: 'Tech 2', current: 0, next: 0 },
                                                { name: 'Tech 3', current: 0, next: 0 },
                                                { name: 'Tech 4', current: 0, next: 0 },
                                            ]} barGap={8}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={10} />
                                                <YAxis domain={[0, 3]} tick={{ fontSize: 13, fill: '#9ca3af' }} axisLine={false} tickLine={false} ticks={[0, 0.5, 1, 1.5, 2, 2.5, 3]} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    cursor={{ fill: '#f9fafb' }}
                                                />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
                                                <Bar dataKey="current" name="This Round" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={32} />
                                                <Bar dataKey="next" name="Next Round" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Tables Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* In-house Development Table */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-2xl">In-house Development</h3>
                                            <p className="text-base text-gray-400 mt-1">Invest in technology and features</p>
                                        </div>
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <TrendingUp className="w-5 h-5 text-red-600" />
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <table className="w-full text-base">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="p-4 text-left text-base font-bold text-gray-400 uppercase tracking-wider w-1/4">Technology</th>
                                                    <th className="p-4 text-right text-base font-bold text-gray-400 uppercase tracking-wider">This Round (k USD)</th>
                                                    <th className="p-4 text-right text-base font-bold text-gray-400 uppercase tracking-wider">Last Round (k USD)</th>
                                                    <th className="p-4 text-right text-base font-bold text-gray-400 uppercase tracking-wider">Cost of New Features</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {['tech1', 'tech2', 'tech3', 'tech4'].map((tech, idx) => (
                                                    <tr key={tech} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-4 font-medium text-gray-700">Technology {idx + 1}</td>
                                                        <td className="p-4">
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base font-medium text-right focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                                                    value={currentTeamState.decisions.rnd[tech]?.spend || 0}
                                                                    onChange={(e) => handleRndChange(tech, 'spend', parseFloat(e.target.value) || 0)}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-right text-gray-500">0</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">
                                                            {[55000, 190900, 324196, 1287151][idx].toLocaleString().replace(/,/g, ' ')}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-gray-50/50">
                                                    <td className="p-4 font-bold text-gray-900">Total</td>
                                                    <td className="p-4 text-right font-bold text-gray-900">
                                                        {Object.values(currentTeamState.decisions.rnd).reduce((sum, item) => sum + (item.spend || 0), 0).toLocaleString()}
                                                    </td>
                                                    <td className="p-4 text-right font-bold text-gray-900">0</td>
                                                    <td className="p-4"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Feature Introduction Table */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-2xl">Feature Introduction</h3>
                                            <p className="text-base text-gray-400 mt-1">Purchase licenses for new features</p>
                                        </div>
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <DollarSign className="w-5 h-5 text-red-600" />
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <table className="w-full text-base">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="p-4 text-left text-base font-bold text-gray-400 uppercase tracking-wider w-1/4">Technology</th>
                                                    <th className="p-4 text-left text-base font-bold text-gray-400 uppercase tracking-wider w-1/2">Additional Features</th>
                                                    <th className="p-4 text-right text-base font-bold text-gray-400 uppercase tracking-wider">Cost (USD)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {['tech1', 'tech2', 'tech3', 'tech4'].map((tech, idx) => {
                                                    const selectedOption = currentTeamState.decisions.rnd[tech]?.features || 'Not purchased';

                                                    // Calculate cost based on selection
                                                    let cost = 0;
                                                    if (selectedOption !== 'Not purchased') {
                                                        const match = selectedOption.match(/\+(\d+)/);
                                                        const numFeatures = match ? parseInt(match[1]) : 1;

                                                        if (tech === 'tech1') {
                                                            // Tech 1: 55,000 base (1 feature) + 55,000 per additional feature
                                                            cost = numFeatures * 55000;
                                                        } else {
                                                            // Tech 2+: 150,000 base (1 feature) + 65,000 per additional feature
                                                            cost = 150000 + (numFeatures - 1) * 65000;
                                                        }
                                                    }

                                                    return (
                                                        <tr key={tech} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="p-4 font-medium text-gray-700">Technology {idx + 1}</td>
                                                            <td className="p-4">
                                                                <div className="relative">
                                                                    <select
                                                                        className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 text-base font-medium text-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                                                        value={selectedOption}
                                                                        onChange={(e) => handleRndChange(tech, 'features', e.target.value)}
                                                                    >
                                                                        <option value="Not purchased">Not purchased</option>
                                                                        <option value="Enable this technology + 1 function">Enable this technology + 1 function</option>
                                                                        <option value="Enable this technology + 2 functions">Enable this technology + 2 functions</option>
                                                                        <option value="Enable this technology + 3 functions">Enable this technology + 3 functions</option>
                                                                        <option value="Enable this technology + 4 functions">Enable this technology + 4 functions</option>
                                                                    </select>
                                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-right text-gray-900 font-medium">
                                                                {cost.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                <tr className="bg-gray-50/50">
                                                    <td className="p-4 font-bold text-gray-900">Total</td>
                                                    <td className="p-4"></td>
                                                    <td className="p-4 text-right font-bold text-gray-900">
                                                        {['tech1', 'tech2', 'tech3', 'tech4'].reduce((sum, tech) => {
                                                            const selectedOption = currentTeamState.decisions.rnd[tech]?.features || 'Not purchased';
                                                            if (selectedOption === 'Not purchased') return sum;
                                                            const match = selectedOption.match(/\+(\d+)/);
                                                            const numFeatures = match ? parseInt(match[1]) : 1;

                                                            let cost = 0;
                                                            if (tech === 'tech1') {
                                                                cost = numFeatures * 55000;
                                                            } else {
                                                                cost = 150000 + (numFeatures - 1) * 65000;
                                                            }
                                                            return sum + cost;
                                                        }, 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MARKETING SECTION */}
                    {activeSection === 'marketing' && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">Marketing Strategy</h2>
                                    <p className="text-lg text-gray-500 mt-1">Manage product features, pricing, and promotion for {marketingRegion.toUpperCase()}</p>
                                </div>
                                {/* Region Tabs */}
                                <div className="flex bg-gray-100/50 p-1 rounded-xl">
                                    {(['usa', 'asia', 'europe'] as const).map(region => (
                                        <button
                                            key={region}
                                            onClick={() => setMarketingRegion(region)}
                                            className={clsx(
                                                "px-4 py-2 text-lg font-medium rounded-lg transition-all capitalize",
                                                marketingRegion === region
                                                    ? "bg-white text-red-600 shadow-sm"
                                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                            )}
                                        >
                                            {region}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Marketing Table for Tech 1 (Example) */}
                            {['tech1'].map((tech, idx) => {
                                const data = currentTeamState.decisions.marketing[marketingRegion][tech];
                                const CURRENCY_LABELS = { usa: 'USD', asia: 'RMB', europe: 'EUR' };
                                const currency = CURRENCY_LABELS[marketingRegion];

                                // Dynamic Calculations
                                const baseDemand = 1084; // Reference from image
                                const basePrice = 280;
                                const price = data.price || 0;
                                const promo = data.promo || 0;
                                const features = data.features || 0;

                                // Simple demand simulation: Price elasticity
                                const estimatedDemand = price > 0
                                    ? Math.round(baseDemand * (basePrice / price))
                                    : 0;

                                const baseUnitCost = 111.4; // Reference from production
                                const featureCost = 6.0;
                                const unitCost = baseUnitCost + (features * featureCost);

                                const salesRevenue = estimatedDemand * price;
                                const productionCost = estimatedDemand * unitCost;
                                const salesProfit = salesRevenue - productionCost;
                                const grossProfit = salesProfit - promo;

                                return (
                                    <div key={tech} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-2xl border-b-2 border-red-500 inline-block pb-1">Technology {idx + 1}</h3>
                                            </div>
                                        </div>
                                        <div className="p-8">
                                            <table className="w-full text-base">
                                                <thead>
                                                    <tr className="bg-red-50/50 border-b border-red-100">
                                                        <th className="p-4 text-left text-base font-bold text-gray-700 uppercase tracking-wider w-1/2"></th>
                                                        <th className="p-4 text-right text-base font-bold text-gray-700 uppercase tracking-wider">This round</th>
                                                        <th className="p-4 text-right text-base font-bold text-gray-700 uppercase tracking-wider">Last round</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    <tr>
                                                        <td className="p-4 font-medium text-gray-700">Number of functions used in this product</td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex justify-end">
                                                                <input
                                                                    type="number"
                                                                    className="w-24 text-right bg-white border border-gray-200 rounded-lg px-3 py-2 text-base font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                                                    value={data.features}
                                                                    onChange={(e) => handleMarketingChange(marketingRegion, tech, 'features', parseFloat(e.target.value) || 0)}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">2</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-4 font-medium text-gray-700">Total number of available functions this round</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium" colSpan={2}>4</td>
                                                    </tr>

                                                    {/* Marketing Inputs */}
                                                    <tr className="bg-gray-50/50">
                                                        <td className="p-4 font-bold text-gray-900" colSpan={3}>marketing</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-4 font-medium text-gray-700">Price, {currency}</td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex justify-end">
                                                                <input
                                                                    type="number"
                                                                    className="w-24 text-right bg-white border border-gray-200 rounded-lg px-3 py-2 text-base font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                                                    value={data.price}
                                                                    onChange={(e) => handleMarketingChange(marketingRegion, tech, 'price', parseFloat(e.target.value) || 0)}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">280</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-4 font-medium text-gray-700">Advertisement, Thousand {currency}</td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex justify-end">
                                                                <input
                                                                    type="number"
                                                                    className="w-24 text-right bg-white border border-gray-200 rounded-lg px-3 py-2 text-base font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                                                    value={data.promo}
                                                                    onChange={(e) => handleMarketingChange(marketingRegion, tech, 'promo', parseFloat(e.target.value) || 0)}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">5 580</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-4 font-medium text-gray-700">Projected demand: 1,000 units</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">{estimatedDemand.toLocaleString()}</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">1 084</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-4 font-medium text-gray-700">Planned sales: 1,000 units</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">{estimatedDemand.toLocaleString()}</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">1 084</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-4 font-medium text-gray-700 flex items-center gap-2">
                                                            Unit cost, USD
                                                            <AlertCircle className="w-4 h-4 text-gray-400" />
                                                        </td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">{unitCost.toFixed(1)}</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium"></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-4 font-medium text-gray-700">Unit cost (including transfer price), USD</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">{unitCost.toFixed(1)}</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium"></td>
                                                    </tr>

                                                    {/* Marginal Accounting */}
                                                    <tr className="bg-gray-50/50">
                                                        <td className="p-4 font-bold text-gray-900" colSpan={3}>Marginal accounting, thousands of {currency}</td>
                                                    </tr>
                                                    <tr className="bg-red-100/50">
                                                        <td className="p-4 text-right font-bold text-gray-900" colSpan={3}>This round</td>
                                                    </tr>
                                                    <tr className="bg-gray-50/50">
                                                        <td className="p-4 font-bold text-gray-900" colSpan={3}>Sales</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-4 pl-8 font-medium text-gray-700">Sales</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">{salesRevenue.toLocaleString()}</td>
                                                        <td className="p-4 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr className="bg-gray-50/50">
                                                        <td className="p-4 font-bold text-gray-900" colSpan={3}>Costs and expenses</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-4 pl-8 text-gray-600">- In-house and outsourced production</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">{productionCost.toLocaleString()}</td>
                                                        <td className="p-4 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-4 pl-8 text-gray-600">- Cost of imported products</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">0</td>
                                                        <td className="p-4 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-4 pl-8 text-gray-600">- Transportation and Customs</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">0</td>
                                                        <td className="p-4 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-4 pl-8 text-gray-600">- Functional cost</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">0</td>
                                                        <td className="p-4 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr className="border-t border-gray-200">
                                                        <td className="p-4 font-bold text-gray-900">Total cost of products sold</td>
                                                        <td className="p-4 text-right text-gray-900 font-bold">{productionCost.toLocaleString()}</td>
                                                        <td className="p-4 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr className="border-t border-gray-200">
                                                        <td className="p-4 font-bold text-gray-900">Sales Profit</td>
                                                        <td className="p-4 text-right text-gray-900 font-bold">{salesProfit.toLocaleString()}</td>
                                                        <td className="p-4 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-4 font-medium text-gray-700">advertise</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">{promo.toLocaleString()}</td>
                                                        <td className="p-4 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr className="border-t border-gray-200 bg-gray-50/30">
                                                        <td className="p-4 font-bold text-gray-900">gross profit</td>
                                                        <td className="p-4 text-right text-gray-900 font-bold">{grossProfit.toLocaleString()}</td>
                                                        <td className="p-4 text-right text-gray-900"></td>
                                                    </tr>

                                                    {/* Available Products */}
                                                    <tr className="bg-gray-50/50">
                                                        <td className="p-4 font-bold text-gray-900" colSpan={3}>Available products, thousands of pieces</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-4 font-medium text-gray-700">need</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">0</td>
                                                        <td className="p-4 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-4 font-medium text-gray-700">Number of products available for sale worldwide</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">3 040</td>
                                                        <td className="p-4 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-4 font-medium text-gray-700">Unmet needs (global)</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">0</td>
                                                        <td className="p-4 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr className="border-t border-gray-200">
                                                        <td className="p-4 font-bold text-gray-900">Global production buffer</td>
                                                        <td className="p-4 text-right text-gray-900 font-bold">3 040</td>
                                                        <td className="p-4 text-right text-gray-900"></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* LOGISTICS SECTION */}
                    {/* LOGISTICS SECTION */}
                    {activeSection === 'logistics' && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {/* LEFT COLUMN */}
                            <div className="space-y-8">
                                {/* Logistics Priority Table */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-2xl">Logistics Priority</h3>
                                            <p className="text-base text-gray-400 mt-1">Manage shipping priorities between regions</p>
                                        </div>
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <ArrowRightLeft className="w-5 h-5 text-red-600" />
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <table className="w-full text-base">
                                            <thead>
                                                <tr className="bg-red-50/50 border-b border-red-100">
                                                    <th className="p-4 text-left text-base font-bold text-gray-700 uppercase tracking-wider w-1/4">technology</th>
                                                    <th className="p-4 text-right text-base font-bold text-gray-700 uppercase tracking-wider">Production, thousands of pieces</th>
                                                    <th className="p-4 text-right text-base font-bold text-gray-700 uppercase tracking-wider">Logistics Priority</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {/* From USA */}
                                                <tr>
                                                    <td className="p-4 font-bold text-gray-900" colSpan={3}>From the United States</td>
                                                </tr>
                                                {['tech1', 'tech2', 'tech3', 'tech4'].map((tech, idx) => (
                                                    <tr key={`usa-${tech}`} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-4 font-medium text-gray-700">Technology {idx + 1}</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">
                                                            {logisticsData.usa[tech].totalProduct.toLocaleString()}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            {idx === 0 ? (
                                                                <div className="flex justify-end">
                                                                    <div className="relative w-full max-w-xs">
                                                                        <select
                                                                            className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 text-base font-medium text-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                                                            value={currentTeamState.decisions.logistics.usa[tech]}
                                                                            onChange={(e) => handleLogisticsChange('usa', tech, e.target.value)}
                                                                        >
                                                                            {LOGISTICS_PRIORITIES.map(p => (
                                                                                <option key={p} value={p}>{p}</option>
                                                                            ))}
                                                                        </select>
                                                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 text-base italic">{idx === 1 ? 'Not sold in any market' : 'Not developed'}</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}

                                                {/* From Asia */}
                                                <tr>
                                                    <td className="p-4 font-bold text-gray-900" colSpan={3}>From Asia</td>
                                                </tr>
                                                {['tech1', 'tech2', 'tech3', 'tech4'].map((tech, idx) => (
                                                    <tr key={`asia-${tech}`} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-4 font-medium text-gray-700">Technology {idx + 1}</td>
                                                        <td className="p-4 text-right text-gray-900 font-medium">
                                                            {logisticsData.asia[tech].totalProduct.toLocaleString()}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <span className="text-gray-400 text-base italic">
                                                                {idx === 0 ? 'Not produced' : idx === 1 ? 'Not sold in any market' : 'Not developed'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Revenue/Cost Chart */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-gray-900 text-2xl">Unit Revenue vs Cost (Excl. Functions)</h3>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <BarChart3 className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart data={['usa', 'asia', 'europe'].map(region => ({
                                                name: `${region.toUpperCase()} Tech 1`,
                                                cost: 100 + (currentTeamState.decisions.marketing[region as 'usa' | 'asia' | 'europe'].tech1.features * 10),
                                                revenue: currentTeamState.decisions.marketing[region as 'usa' | 'asia' | 'europe'].tech1.price
                                            }))} barGap={8} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} dy={10} />
                                                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} label={{ value: 'USD', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    cursor={{ fill: '#f9fafb' }}
                                                />
                                                <Bar yAxisId="left" dataKey="cost" name="Production Cost" fill="#648dae" radius={[0, 0, 0, 0]} barSize={40}>
                                                    <LabelList dataKey="cost" position="top" fill="#1f2937" fontSize={12} fontWeight="bold" />
                                                </Bar>
                                                <Scatter yAxisId="left" dataKey="revenue" name="Unit Revenue" fill="#a855f7" shape="circle">
                                                    <LabelList dataKey="revenue" position="top" fill="#1f2937" fontSize={12} fontWeight="bold" offset={10} />
                                                </Scatter>
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-[#648dae]"></div>
                                            <span>Production Cost</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full border-2 border-[#a855f7]"></div>
                                            <span>Unit Revenue (excl. functions)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="space-y-8">
                                {/* Logistics Plan Table */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-red-600 text-2xl">Logistics plan, thousands of items</h3>
                                        </div>
                                    </div>
                                    <div className="p-0">
                                        {/* USA Section */}
                                        <div className="border-b border-gray-100">
                                            <div className="px-8 py-4 bg-white">
                                                <h4 className="font-bold text-gray-900">USA</h4>
                                            </div>
                                            <table className="w-full text-base">
                                                <thead>
                                                    <tr className="bg-red-100/50 border-y border-red-100">
                                                        <th className="p-3 pl-8 text-left text-base font-bold text-gray-700 uppercase tracking-wider">Metric</th>
                                                        {['tech1', 'tech2', 'tech3', 'tech4'].map((tech, i) => (
                                                            <th key={tech} className="p-3 pr-8 text-right text-base font-bold text-gray-700 uppercase tracking-wider">Tech {i + 1}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {[
                                                        { label: 'Yield', key: 'yield' },
                                                        { label: 'Outsourcing production', key: 'outsourcing' },
                                                        { label: 'Imported from Asia', key: 'importedFromAsia' },
                                                        { label: 'Total Product', key: 'totalProduct' },
                                                        { label: 'Sold in the United States', key: 'sold' },
                                                        { label: 'Export to Asia', key: 'exportToAsia' },
                                                        { label: 'Export to Europe', key: 'exportToEurope' },
                                                        { label: 'Production Buffer', key: 'buffer' },
                                                        { label: 'Unmet needs', key: 'unmet' }
                                                    ].map(row => (
                                                        <tr key={row.key}>
                                                            <td className="p-3 pl-8 text-gray-700">{row.label}</td>
                                                            {['tech1', 'tech2', 'tech3', 'tech4'].map(tech => (
                                                                <td key={tech} className="p-3 pr-8 text-right font-medium text-gray-900">
                                                                    {row.key === 'totalProduct'
                                                                        ? (logisticsData.usa[tech].totalProduct + logisticsData.usa[tech].imported).toLocaleString()
                                                                        : logisticsData.usa[tech][row.key]?.toLocaleString() || '0'}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Asia Section */}
                                        <div className="border-b border-gray-100">
                                            <div className="px-8 py-4 bg-white">
                                                <h4 className="font-bold text-gray-900">Asia</h4>
                                            </div>
                                            <table className="w-full text-base">
                                                <thead>
                                                    <tr className="bg-red-100/50 border-y border-red-100">
                                                        <th className="p-3 pl-8 text-left text-base font-bold text-gray-700 uppercase tracking-wider">Metric</th>
                                                        {['tech1', 'tech2', 'tech3', 'tech4'].map((tech, i) => (
                                                            <th key={tech} className="p-3 pr-8 text-right text-base font-bold text-gray-700 uppercase tracking-wider">Tech {i + 1}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {[
                                                        { label: 'Yield', key: 'yield' },
                                                        { label: 'Outsourcing production', key: 'outsourcing' },
                                                        { label: 'Imported from USA', key: 'importedFromUsa' },
                                                        { label: 'Total Product', key: 'totalProduct' },
                                                        { label: 'Sales in Asia', key: 'sold' },
                                                        { label: 'Exported to USA', key: 'exportToUsa' },
                                                        { label: 'Export to Europe', key: 'exportToEurope' },
                                                        { label: 'Production Buffer', key: 'buffer' },
                                                        { label: 'Unmet needs', key: 'unmet' }
                                                    ].map(row => (
                                                        <tr key={row.key}>
                                                            <td className="p-3 pl-8 text-gray-700">{row.label}</td>
                                                            {['tech1', 'tech2', 'tech3', 'tech4'].map(tech => (
                                                                <td key={tech} className="p-3 pr-8 text-right font-medium text-gray-900">
                                                                    {row.key === 'totalProduct'
                                                                        ? (logisticsData.asia[tech].totalProduct + logisticsData.asia[tech].imported).toLocaleString()
                                                                        : logisticsData.asia[tech][row.key]?.toLocaleString() || '0'}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Europe Section */}
                                        <div>
                                            <div className="px-8 py-4 bg-white">
                                                <h4 className="font-bold text-gray-900">Europe</h4>
                                            </div>
                                            <table className="w-full text-base">
                                                <thead>
                                                    <tr className="bg-red-100/50 border-y border-red-100">
                                                        <th className="p-3 pl-8 text-left text-base font-bold text-gray-700 uppercase tracking-wider">Metric</th>
                                                        {['tech1', 'tech2', 'tech3', 'tech4'].map((tech, i) => (
                                                            <th key={tech} className="p-3 pr-8 text-right text-base font-bold text-gray-700 uppercase tracking-wider">Tech {i + 1}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {[
                                                        { label: 'Yield', key: 'yield' },
                                                        { label: 'Outsourcing production', key: 'outsourcing' },
                                                        { label: 'Imported from USA', key: 'importedFromUsa' },
                                                        { label: 'Imported from Asia', key: 'importedFromAsia' },
                                                        { label: 'Total Product', key: 'totalProduct' },
                                                        { label: 'Sold in Europe', key: 'sold' },
                                                        { label: 'Production Buffer', key: 'buffer' },
                                                        { label: 'Unmet needs', key: 'unmet' }
                                                    ].map(row => (
                                                        <tr key={row.key}>
                                                            <td className="p-3 pl-8 text-gray-700">{row.label}</td>
                                                            {['tech1', 'tech2', 'tech3', 'tech4'].map(tech => (
                                                                <td key={tech} className="p-3 pr-8 text-right font-medium text-gray-900">
                                                                    {row.key === 'totalProduct'
                                                                        ? (logisticsData.europe[tech].totalProduct + logisticsData.europe[tech].imported).toLocaleString()
                                                                        : logisticsData.europe[tech][row.key]?.toLocaleString() || '0'}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAX SECTION */}
                    {activeSection === 'tax' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* LEFT COLUMN: Transfer Pricing */}
                                <div className="space-y-8">
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-2xl">Transfer pricing</h3>
                                            </div>
                                            <div className="p-2 bg-gray-50 rounded-full text-gray-400">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <p className="text-base text-gray-600 mb-6 border-l-4 border-red-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                                                The transfer price is related to your unit cost. It must be in the range of 1-2. For example, if your decision is 1.5, then the transfer price is 1.5 times the unit cost.
                                            </p>
                                            <table className="w-full text-base">
                                                <thead>
                                                    <tr className="bg-red-50/50 border-y border-red-100">
                                                        <th className="p-3 pl-4 text-left text-base font-bold text-gray-700 uppercase tracking-wider">From</th>
                                                        <th className="p-3 text-left text-base font-bold text-gray-700 uppercase tracking-wider">to</th>
                                                        <th className="p-3 text-right text-base font-bold text-gray-700 uppercase tracking-wider">This round</th>
                                                        <th className="p-3 pr-4 text-right text-base font-bold text-gray-700 uppercase tracking-wider">Last round</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {[
                                                        { from: 'USA', to: 'Asia', key: 'usaToAsia', last: 1.50 },
                                                        { from: 'USA', to: 'Europe', key: 'usaToEurope', last: 1.00 },
                                                        { from: 'Asia', to: 'USA', key: 'asiaToUsa', last: 1.00 },
                                                        { from: 'Asia', to: 'Europe', key: 'asiaToEurope', last: 1.00 }
                                                    ].map((route) => (
                                                        <tr key={route.key} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="p-3 pl-4 font-medium text-gray-700">{route.from}</td>
                                                            <td className="p-3 text-gray-700 flex items-center gap-2">
                                                                <span className="text-gray-400">→</span>
                                                                {route.to}
                                                            </td>
                                                            <td className="p-3 text-right">
                                                                <div className="flex justify-end">
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        max="2"
                                                                        step="0.01"
                                                                        className="w-24 text-right bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-base font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                                                        value={currentTeamState.decisions.tax.transferPrice[route.key as keyof typeof currentTeamState.decisions.tax.transferPrice]}
                                                                        onChange={(e) => handleTaxChange(route.key as any, parseFloat(e.target.value) || 1)}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="p-3 pr-4 text-right text-gray-900 font-medium">{route.last.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN: Taxes Table & Chart */}
                                <div className="space-y-8">
                                    {/* Taxes Table */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-8 py-6 border-b border-gray-50">
                                            <h3 className="font-bold text-red-600 text-2xl">Taxes, thousands of USD</h3>
                                        </div>
                                        <div className="p-0">
                                            <table className="w-full text-base">
                                                <thead>
                                                    <tr className="bg-red-50/50 border-y border-red-100">
                                                        <th className="p-3 pl-6 text-left text-base font-bold text-gray-700 uppercase tracking-wider w-1/3"></th>
                                                        <th className="p-3 text-right text-base font-bold text-gray-700 uppercase tracking-wider">USA</th>
                                                        <th className="p-3 text-right text-base font-bold text-gray-700 uppercase tracking-wider">Asia</th>
                                                        <th className="p-3 text-right text-base font-bold text-gray-700 uppercase tracking-wider">Europe</th>
                                                        <th className="p-3 pr-6 text-right text-base font-bold text-gray-700 uppercase tracking-wider">worldwide</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    <tr>
                                                        <td className="p-3 pl-6 text-gray-700">Pre-tax profit</td>
                                                        <td className="p-3 text-right font-medium">{taxData.financials.usa.taxable.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                        <td className="p-3 text-right font-medium">{taxData.financials.asia.taxable.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                        <td className="p-3 text-right font-medium">{taxData.financials.europe.taxable.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                        <td className="p-3 pr-6 text-right font-bold text-gray-900">{taxData.globalTaxable.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-gray-700">Loss carryforward</td>
                                                        <td className="p-3 text-right font-medium">0</td>
                                                        <td className="p-3 text-right font-medium">0</td>
                                                        <td className="p-3 text-right font-medium">0</td>
                                                        <td className="p-3 pr-6 text-right text-gray-400">-</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-gray-700">Taxable profits</td>
                                                        <td className="p-3 text-right font-medium">{Math.max(0, taxData.financials.usa.taxable).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                        <td className="p-3 text-right font-medium">{Math.max(0, taxData.financials.asia.taxable).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                        <td className="p-3 text-right font-medium">{Math.max(0, taxData.financials.europe.taxable).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                        <td className="p-3 pr-6 text-right font-bold text-gray-900">{Math.max(0, taxData.globalTaxable).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-gray-700">Statutory tax rate, %</td>
                                                        <td className="p-3 text-right font-medium">{taxData.taxRates.usa.toFixed(1)}</td>
                                                        <td className="p-3 text-right font-medium">{taxData.taxRates.asia.toFixed(1)}</td>
                                                        <td className="p-3 text-right font-medium">{taxData.taxRates.europe.toFixed(1)}</td>
                                                        <td className="p-3 pr-6 text-right text-gray-400">-</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-gray-700">Income tax</td>
                                                        <td className="p-3 text-right font-medium">{taxData.financials.usa.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                        <td className="p-3 text-right font-medium">{taxData.financials.asia.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                        <td className="p-3 text-right font-medium">{taxData.financials.europe.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                        <td className="p-3 pr-6 text-right font-bold text-gray-900">{taxData.globalTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-gray-700">Profits in this round</td>
                                                        <td className="p-3 text-right font-medium">{taxData.financials.usa.net.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                        <td className="p-3 text-right font-medium">{taxData.financials.asia.net.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                        <td className="p-3 text-right font-medium">{taxData.financials.europe.net.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                        <td className="p-3 pr-6 text-right font-bold text-gray-900">{(taxData.globalTaxable - taxData.globalTax).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-gray-700">Effective tax rate, %</td>
                                                        <td className="p-3 text-right font-medium">{(taxData.financials.usa.taxable > 0 ? (taxData.financials.usa.tax / taxData.financials.usa.taxable * 100) : 0).toFixed(1)}</td>
                                                        <td className="p-3 text-right font-medium">{(taxData.financials.asia.taxable > 0 ? (taxData.financials.asia.tax / taxData.financials.asia.taxable * 100) : 0).toFixed(1)}</td>
                                                        <td className="p-3 text-right font-medium">{(taxData.financials.europe.taxable > 0 ? (taxData.financials.europe.tax / taxData.financials.europe.taxable * 100) : 0).toFixed(1)}</td>
                                                        <td className="p-3 pr-6 text-right font-bold text-gray-900">{(taxData.globalTaxable > 0 ? (taxData.globalTax / taxData.globalTaxable * 100) : 0).toFixed(1)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 pl-6 text-gray-700">Carry forward the remaining losses</td>
                                                        <td className="p-3 text-right font-medium">{Math.abs(Math.min(0, taxData.financials.usa.taxable)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                        <td className="p-3 text-right font-medium">{Math.abs(Math.min(0, taxData.financials.asia.taxable)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                        <td className="p-3 text-right font-medium">{Math.abs(Math.min(0, taxData.financials.europe.taxable)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                        <td className="p-3 pr-6 text-right text-gray-400">-</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Tax Chart */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-gray-900 text-2xl">Tax Analysis</h3>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                <BarChart3 className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </div>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ComposedChart data={[
                                                    { name: 'USA', profit: taxData.financials.usa.taxable, rate: taxData.financials.usa.taxable > 0 ? (taxData.financials.usa.tax / taxData.financials.usa.taxable * 100) : 0 },
                                                    { name: 'Asia', profit: taxData.financials.asia.taxable, rate: taxData.financials.asia.taxable > 0 ? (taxData.financials.asia.tax / taxData.financials.asia.taxable * 100) : 0 },
                                                    { name: 'Europe', profit: taxData.financials.europe.taxable, rate: taxData.financials.europe.taxable > 0 ? (taxData.financials.europe.tax / taxData.financials.europe.taxable * 100) : 0 },
                                                    { name: 'Global', profit: taxData.globalTaxable, rate: taxData.globalTaxable > 0 ? (taxData.globalTax / taxData.globalTaxable * 100) : 0 }
                                                ]} barGap={8} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} dy={10} />
                                                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} label={{ value: 'Taxable Profit (USD)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }} />
                                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} label={{ value: 'Effective Rate (%)', angle: 90, position: 'insideRight', fill: '#9ca3af', fontSize: 12 }} />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                        cursor={{ fill: '#f9fafb' }}
                                                    />
                                                    <Bar yAxisId="left" dataKey="profit" name="Taxable Profit" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40}>
                                                        <LabelList dataKey="profit" position="top" fill="#1f2937" fontSize={12} fontWeight="bold" formatter={(val: any) => val.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                                                    </Bar>
                                                    <Scatter yAxisId="right" dataKey="rate" name="Effective Tax Rate" fill="#3b82f6" shape="circle">
                                                        <LabelList dataKey="rate" position="top" fill="#1f2937" fontSize={12} fontWeight="bold" offset={10} formatter={(val: any) => val.toFixed(1) + '%'} />
                                                    </Scatter>
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-[#f59e0b]"></div>
                                                <span>Taxable Profit</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                                                <span>Effective Tax Rate</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NEW FINANCE SECTION */}
                    {activeSection === 'finance' && (
                        <div className="space-y-8">
                            {/* Top Row: Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Equity & Liabilities Chart */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-2xl">Equity & Liabilities (Composite), %</h3>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <BarChart3 className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                { name: 'Last Round', equity: 55, shortTerm: 0, longTerm: 45 },
                                                { name: 'This Round', equity: 60, shortTerm: 5, longTerm: 35 },
                                            ]} barSize={40}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} dy={10} />
                                                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    cursor={{ fill: '#f9fafb' }}
                                                />
                                                <Legend iconType="rect" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                                <Bar dataKey="equity" stackId="a" name="Equity" fill="#3b82f6" />
                                                <Bar dataKey="shortTerm" stackId="a" name="Short-term Debt" fill="#ef4444" />
                                                <Bar dataKey="longTerm" stackId="a" name="Long-term Debt" fill="#fbbf24" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Treasury Management Chart */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-2xl">International Treasury Management, USD</h3>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <Globe className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                { name: 'USA', cash: financeData.endingCash * 0.6, longTerm: 500000, shortTerm: 345926 },
                                                { name: 'Asia', cash: financeData.endingCash * 0.2, longTerm: 0, shortTerm: 0 },
                                                { name: 'Europe', cash: financeData.endingCash * 0.2, longTerm: 0, shortTerm: 0 },
                                            ]} barSize={40}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} dy={10} />
                                                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} label={{ value: 'USD', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    cursor={{ fill: '#f9fafb' }}
                                                    formatter={(value: number) => value.toLocaleString()}
                                                />
                                                <Legend iconType="rect" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                                <Bar dataKey="cash" stackId="a" name="Cash" fill="#84cc16" />
                                                <Bar dataKey="longTerm" stackId="a" name="Long-term Loans" fill="#fbbf24" />
                                                <Bar dataKey="shortTerm" stackId="a" name="Short-term Loans" fill="#ef4444" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Row: Decisions & Tables */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* Left Column: Financing Decisions */}
                                <div className="space-y-8">
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-2xl">Financing Decisions</h3>
                                                <p className="text-base text-gray-400 mt-1">Manage capital structure and dividends</p>
                                            </div>
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Settings className="w-5 h-5 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="p-8">
                                            <table className="w-full text-base">
                                                <tbody className="divide-y divide-gray-50">
                                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-4 font-medium text-gray-700">Long-term Loans (Change)</td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex justify-end items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    className="w-32 text-right bg-white border border-gray-200 rounded-lg px-3 py-2 text-base font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                                    value={currentTeamState.decisions.finance.longTermLoans}
                                                                    onChange={(e) => handleFinanceChange('longTermLoans', parseFloat(e.target.value) || 0)}
                                                                />
                                                                <span className="text-gray-400 text-sm">kUSD</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-4 font-medium text-gray-700">Issue Shares</td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex justify-end items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    className="w-32 text-right bg-white border border-gray-200 rounded-lg px-3 py-2 text-base font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                                    value={currentTeamState.decisions.finance.issueShares}
                                                                    onChange={(e) => handleFinanceChange('issueShares', parseFloat(e.target.value) || 0)}
                                                                />
                                                                <span className="text-gray-400 text-sm">kShares</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-4 font-medium text-gray-700">Buyback Shares</td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex justify-end items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    className="w-32 text-right bg-white border border-gray-200 rounded-lg px-3 py-2 text-base font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                                    value={currentTeamState.decisions.finance.buybackShares}
                                                                    onChange={(e) => handleFinanceChange('buybackShares', parseFloat(e.target.value) || 0)}
                                                                />
                                                                <span className="text-gray-400 text-sm">kShares</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-4 font-medium text-gray-700">Dividend Payment</td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex justify-end items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    className="w-32 text-right bg-white border border-gray-200 rounded-lg px-3 py-2 text-base font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                                    value={currentTeamState.decisions.finance.dividend}
                                                                    onChange={(e) => handleFinanceChange('dividend', parseFloat(e.target.value) || 0)}
                                                                />
                                                                <span className="text-gray-400 text-sm">kUSD</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Internal Loans & Cash Flow */}
                                <div className="space-y-8">
                                    {/* Internal Loans */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-2xl">Internal Loans</h3>
                                                <p className="text-base text-gray-400 mt-1">Manage inter-company financing (k USD)</p>
                                            </div>
                                            <div className="p-2 bg-purple-50 rounded-lg">
                                                <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                                            </div>
                                        </div>
                                        <div className="p-8 space-y-6">
                                            <div className="flex justify-between items-center text-lg">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <span>USA</span>
                                                    <ArrowRightLeft className="w-3 h-3" />
                                                    <span>Asia</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base text-gray-400">(+ to Asia, - to USA)</span>
                                                    <input
                                                        type="number"
                                                        className="w-32 text-right bg-white border border-gray-200 rounded-lg px-3 py-2 text-base font-medium focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                                        value={currentTeamState.decisions.finance.internalLoans.usaToAsia}
                                                        onChange={(e) => handleFinanceChange('internalLoans', { ...currentTeamState.decisions.finance.internalLoans, usaToAsia: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-lg">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <span>USA</span>
                                                    <ArrowRightLeft className="w-3 h-3" />
                                                    <span>Europe</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base text-gray-400">(+ to Europe, - to USA)</span>
                                                    <input
                                                        type="number"
                                                        className="w-32 text-right bg-white border border-gray-200 rounded-lg px-3 py-2 text-base font-medium focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                                        value={currentTeamState.decisions.finance.internalLoans.usaToEurope}
                                                        onChange={(e) => handleFinanceChange('internalLoans', { ...currentTeamState.decisions.finance.internalLoans, usaToEurope: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cash Flow Statement */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-2xl">Cash Flow Statement</h3>
                                                <p className="text-base text-gray-400 mt-1">Parent company (k USD)</p>
                                            </div>
                                            <div className="p-2 bg-green-50 rounded-lg">
                                                <TrendingUp className="w-5 h-5 text-green-600" />
                                            </div>
                                        </div>
                                        <div className="p-8">
                                            <table className="w-full text-lg">
                                                <tbody className="divide-y divide-gray-50">
                                                    <tr className="bg-gray-50/50"><td className="p-3 font-bold text-gray-900" colSpan={2}>Operating Activities</td></tr>
                                                    <tr><td className="p-3 pl-6 text-gray-600">EBITDA</td><td className="p-3 text-right font-medium">{financeData.ebitda.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td></tr>
                                                    <tr><td className="p-3 pl-6 text-gray-600">Change in Accounts Receivable</td><td className="p-3 text-right font-medium text-green-600">+11 686</td></tr>
                                                    <tr><td className="p-3 pl-6 text-gray-600">Change in Inventory</td><td className="p-3 text-right font-medium">0</td></tr>
                                                    <tr><td className="p-3 pl-6 text-gray-600">Change in Accounts Payable</td><td className="p-3 text-right font-medium text-red-600">-18 180</td></tr>
                                                    <tr><td className="p-3 pl-6 text-gray-600">Net Financing Costs</td><td className="p-3 text-right font-medium text-red-600">-56 350</td></tr>
                                                    <tr><td className="p-3 pl-6 text-gray-600">Income Tax</td><td className="p-3 text-right font-medium">-{financeData.taxPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td></tr>
                                                    <tr className="bg-gray-50/50 font-bold"><td className="p-3 pl-6 text-gray-900">Net Cash from Operations</td><td className="p-3 text-right text-gray-900">{(financeData.ebitda + 11686 - 18180 - 56350 - financeData.taxPaid).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td></tr>

                                                    <tr className="bg-gray-50/50"><td className="p-3 font-bold text-gray-900" colSpan={2}>Investing Activities</td></tr>
                                                    <tr><td className="p-3 pl-6 text-gray-600">Factory Investment</td><td className="p-3 text-right font-medium">-{financeData.investment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td></tr>
                                                    <tr className="bg-gray-50/50 font-bold"><td className="p-3 pl-6 text-gray-900">Net Cash from Investing</td><td className="p-3 text-right font-medium">-{financeData.investment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td></tr>

                                                    <tr className="bg-gray-50/50"><td className="p-3 font-bold text-gray-900" colSpan={2}>Financing Activities</td></tr>
                                                    <tr><td className="p-3 pl-6 text-gray-600">Dividends Paid</td><td className="p-3 text-right font-medium">-{currentTeamState.decisions.finance.dividend.toLocaleString()}</td></tr>
                                                    <tr><td className="p-3 pl-6 text-gray-600">Share Issues/Buybacks</td><td className="p-3 text-right font-medium">{((currentTeamState.decisions.finance.issueShares - currentTeamState.decisions.finance.buybackShares) * financeData.shares.price / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td></tr>
                                                    <tr><td className="p-3 pl-6 text-gray-600">Change in Long-term Loans</td><td className="p-3 text-right font-medium">{currentTeamState.decisions.finance.longTermLoans.toLocaleString()}</td></tr>
                                                    <tr><td className="p-3 pl-6 text-gray-600">Change in Short-term Loans</td><td className={`p-3 text-right font-medium ${financeData.stLoansNeeded > 0 ? 'text-green-600' : 'text-gray-900'}`}>{financeData.stLoansNeeded > 0 ? '+' : ''}{financeData.stLoansNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td></tr>
                                                    <tr className="bg-gray-50/50 font-bold"><td className="p-3 pl-6 text-gray-900">Net Cash from Financing</td><td className="p-3 text-right text-gray-900">{financeData.financingFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td></tr>

                                                    <tr className="border-t-2 border-gray-100"><td className="p-4 font-bold text-gray-900">Net Change in Cash</td><td className="p-4 text-right font-bold text-gray-900">{financeData.netCashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td></tr>
                                                    <tr><td className="p-3 text-gray-600">Beginning Cash Balance</td><td className="p-3 text-right font-medium">{financeData.beginningCash.toLocaleString()}</td></tr>
                                                    <tr className="bg-blue-50"><td className="p-4 font-bold text-blue-900">Ending Cash Balance</td><td className="p-4 text-right font-bold text-blue-900">{financeData.endingCash.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
