import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { Holding, ReportStatus } from '@/lib/types'
import { AcceptedPortfolio } from '@/lib/types'

// Register fonts — fallback to Helvetica if Google Fonts unavailable in server env
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v20/UcCM3FwrK3iLTcvneQg7Ca725JhhKnNqk4j1ebLhAm8SrXTc2dthjQ.ttf',
      fontWeight: 400,
      fontStyle: 'italic',
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf',
      fontWeight: 600,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf',
      fontWeight: 700,
    },
  ],
})

Font.register({
  family: 'PlayfairDisplay',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDQ.ttf',
      fontWeight: 700,
    },
  ],
})

const COLORS = {
  primary: '#004750',
  accent: '#A67959',
  text: '#283745',
  sage: '#7A9099',
  border: '#E0DEDA',
  background: '#FAFAFA',
  green: '#2D6A4F',
  red: '#BA1A1A',
  white: '#FFFFFF',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    paddingBottom: 40,
  },
  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
  },
  firmName: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.accent,
    letterSpacing: 2,
  },
  firmSub: {
    fontSize: 7,
    color: '#ffffff80',
    letterSpacing: 3,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  reportTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 14,
    color: COLORS.white,
    textAlign: 'right',
  },
  reportMonth: {
    fontSize: 7,
    color: '#ffffff80',
    textAlign: 'right',
    letterSpacing: 2,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  // Body
  body: {
    paddingHorizontal: 40,
    paddingTop: 28,
  },
  // Client info
  preparedLabel: {
    fontSize: 7,
    color: COLORS.sage,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  clientName: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 22,
    fontWeight: 700,
    color: COLORS.text,
    lineHeight: 1.2,
  },
  advisorName: {
    fontSize: 8,
    color: COLORS.sage,
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Metrics
  metricsRow: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: COLORS.border,
    marginTop: 20,
    marginBottom: 24,
    paddingVertical: 14,
  },
  metricBlock: {
    flex: 1,
    paddingHorizontal: 12,
    borderRightWidth: 0.5,
    borderRightColor: COLORS.border,
  },
  metricBlockLast: {
    flex: 1,
    paddingHorizontal: 12,
  },
  metricLabel: {
    fontSize: 7,
    color: COLORS.sage,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 600,
    color: COLORS.text,
  },
  metricGreen: {
    fontSize: 16,
    fontWeight: 600,
    color: COLORS.green,
  },
  metricRed: {
    fontSize: 16,
    fontWeight: 600,
    color: COLORS.red,
  },
  // Holdings table
  sectionTitle: {
    fontSize: 7,
    fontWeight: 700,
    color: COLORS.sage,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 700,
    color: COLORS.sage,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.3,
    borderBottomColor: COLORS.border,
    paddingVertical: 7,
    alignItems: 'center',
  },
  tableTotalRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 2,
    alignItems: 'center',
  },
  colName: { flex: 3 },
  colValue: { flex: 2, textAlign: 'right' },
  colWeight: { flex: 1.5, textAlign: 'right' },
  colMoM: { flex: 1.5, textAlign: 'right' },
  cellText: { fontSize: 8.5, color: COLORS.text },
  cellBold: { fontSize: 8.5, fontWeight: 700, color: COLORS.text, textTransform: 'uppercase' },
  cellGreen: { fontSize: 8.5, color: COLORS.green },
  cellRed: { fontSize: 8.5, color: COLORS.red },
  cellMuted: { fontSize: 8, color: COLORS.sage },
  // Allocation
  allocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  allocationLabel: { fontSize: 8, color: COLORS.sage, flex: 2, textTransform: 'capitalize' },
  allocationPct: { fontSize: 8, fontWeight: 600, color: COLORS.text },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingHorizontal: 40,
    paddingVertical: 12,
  },
  footerDisclaimer: {
    fontSize: 6,
    color: COLORS.sage,
    lineHeight: 1.6,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 6.5,
    color: '#7A909980',
  },
})

// Deterministic mock returns — same logic as the frontend
function mockReturn(id: string, multiplier: number): number {
  let hash = 0
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff
  const base = (Math.abs(hash) % 150) / 10
  return Math.round((base * multiplier + multiplier * 2) * 10) / 10
}

function formatCurrency(n: number) {
  return '€' + n.toLocaleString('en-IE', { maximumFractionDigits: 0 })
}

const ASSET_CLASS_COLORS: Record<string, string> = {
  equity: COLORS.primary,
  etf: COLORS.accent,
  bond: COLORS.sage,
  cash: '#C4B8AE',
}

interface ReportDocumentProps {
  clientId: string
  clientName: string
  advisorName: string
  advisorTitle: string
  totalValue: number
  monthlyPerformance: number
  portfolio: AcceptedPortfolio
  reportStatus?: ReportStatus
}

export default function ReportDocument({
  clientId,
  clientName,
  advisorName,
  advisorTitle,
  totalValue,
  monthlyPerformance,
  portfolio,
}: ReportDocumentProps) {
  const ytd = mockReturn(clientId, 3.2)
  const inception = mockReturn(clientId, 8.5)

  // Aggregate allocation by asset class
  const allocation = portfolio.holdings.reduce<Record<string, number>>((acc, h) => {
    acc[h.assetClass] = (acc[h.assetClass] ?? 0) + h.currentWeighting
    return acc
  }, {})

  return (
    <Document
      title={`${clientName} — Monthly Portfolio Report — March 2026`}
      author="Kestrel Capital"
      subject="Monthly Portfolio Report"
      creator="Project Direct"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.firmName}>CLINCH</Text>
            <Text style={styles.firmSub}>Wealth Management</Text>
          </View>
          <View>
            <Text style={styles.reportTitle}>Monthly Portfolio Report</Text>
            <Text style={styles.reportMonth}>March 2026</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Client info */}
          <Text style={styles.preparedLabel}>Prepared for</Text>
          <Text style={styles.clientName}>{clientName}</Text>
          <Text style={styles.advisorName}>
            Relationship Manager: {advisorName} — {advisorTitle}
          </Text>

          {/* Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricBlock}>
              <Text style={styles.metricLabel}>Portfolio Value</Text>
              <Text style={styles.metricValue}>{formatCurrency(totalValue)}</Text>
            </View>
            <View style={styles.metricBlock}>
              <Text style={styles.metricLabel}>Monthly Return</Text>
              <Text style={monthlyPerformance >= 0 ? styles.metricGreen : styles.metricRed}>
                {monthlyPerformance >= 0 ? '↑' : '↓'} {Math.abs(monthlyPerformance).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.metricBlock}>
              <Text style={styles.metricLabel}>YTD Return</Text>
              <Text style={styles.metricGreen}>↑ {ytd}%</Text>
            </View>
            <View style={styles.metricBlockLast}>
              <Text style={styles.metricLabel}>Since Inception</Text>
              <Text style={styles.metricGreen}>↑ {inception}%</Text>
            </View>
          </View>

          {/* Two columns: holdings + allocation */}
          <View style={{ flexDirection: 'row', gap: 28 }}>
            {/* Holdings table */}
            <View style={{ flex: 3 }}>
              <Text style={styles.sectionTitle}>Holdings</Text>
              {/* Table header */}
              <View style={styles.tableHeader}>
                <View style={styles.colName}>
                  <Text style={styles.tableHeaderCell}>Holding</Text>
                </View>
                <View style={styles.colValue}>
                  <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>Value</Text>
                </View>
                <View style={styles.colWeight}>
                  <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>Weight</Text>
                </View>
                <View style={styles.colMoM}>
                  <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>MoM</Text>
                </View>
              </View>
              {/* Rows */}
              {portfolio.holdings.map((h: Holding) => {
                const value = Math.round((h.currentWeighting / 100) * totalValue)
                const isPos = h.performance >= 0
                return (
                  <View key={h.ticker} style={styles.tableRow}>
                    <View style={styles.colName}>
                      <Text style={styles.cellText}>{h.name}</Text>
                      <Text style={styles.cellMuted}>{h.ticker}</Text>
                    </View>
                    <View style={styles.colValue}>
                      <Text style={styles.cellText}>{formatCurrency(value)}</Text>
                    </View>
                    <View style={styles.colWeight}>
                      <Text style={styles.cellText}>{h.currentWeighting.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.colMoM}>
                      <Text style={isPos ? styles.cellGreen : styles.cellRed}>
                        {isPos ? '+' : ''}{h.performance.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                )
              })}
              {/* Total row */}
              <View style={styles.tableTotalRow}>
                <View style={styles.colName}>
                  <Text style={styles.cellBold}>Total</Text>
                </View>
                <View style={styles.colValue}>
                  <Text style={styles.cellBold}>{formatCurrency(totalValue)}</Text>
                </View>
                <View style={styles.colWeight}>
                  <Text style={styles.cellBold}>100.0%</Text>
                </View>
                <View style={styles.colMoM}>
                  <Text style={monthlyPerformance >= 0 ? styles.cellGreen : styles.cellRed}>
                    {monthlyPerformance >= 0 ? '+' : ''}{monthlyPerformance.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Allocation panel */}
            <View style={{ flex: 1.2, paddingTop: 0 }}>
              <Text style={styles.sectionTitle}>Allocation</Text>
              <View style={{ marginTop: 4, gap: 2 }}>
                {Object.entries(allocation).map(([cls, pct]) => (
                  <View key={cls} style={styles.allocationRow}>
                    <View style={[styles.dot, { backgroundColor: ASSET_CLASS_COLORS[cls] ?? COLORS.border }]} />
                    <Text style={styles.allocationLabel}>{cls}</Text>
                    <Text style={styles.allocationPct}>{pct.toFixed(1)}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerDisclaimer}>
            This report is for information purposes only and does not constitute investment advice.
            Prepared by Kestrel Capital — Confidential. All portfolio values as at 31 March 2026.
          </Text>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Kestrel Capital | Dublin 2, Ireland</Text>
            <Text style={styles.footerText}>Prepared by {advisorName}</Text>
            <Text style={styles.footerText}>Page 1 of 1</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
