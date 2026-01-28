import { ExportHistory } from '../models/types.js'
import { exportHistoryRepository } from '../models/index.js'

export class ExportService {
  async exportMetaCSV(sessionId: string, targeting: any): Promise<string> {
    const csv = 'Interest,Behavior,Age Range\nMarketing,Business Owner,25-54'
    
    await exportHistoryRepository.createExport({
      session_id: sessionId,
      export_type: 'meta_csv',
      filename: `meta_export_${Date.now()}.csv`,
      export_data: { format: 'csv', row_count: 1 }
    })
    
    return csv
  }

  async exportGoogleCSV(sessionId: string, targeting: any): Promise<string> {
    const csv = 'Keyword,Match Type,Search Volume\nmarketing software,phrase,1000'
    
    await exportHistoryRepository.createExport({
      session_id: sessionId,
      export_type: 'google_csv',
      filename: `google_export_${Date.now()}.csv`,
      export_data: { format: 'csv', row_count: 1 }
    })
    
    return csv
  }
}

export const exportService = new ExportService()
