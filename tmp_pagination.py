import os
import re

def add_pagination_transactions():
    filepath = r"d:\Infosys_Milestone_2\banking-frontend\banking-frontend\src\pages\Transactions.jsx"
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if "const [currentPage, setCurrentPage] = useState(1);" not in content:
        # Add state
        content = content.replace(
            'const [searchTerm, setSearchTerm] = useState("");',
            'const [searchTerm, setSearchTerm] = useState("");\n  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 20;'
        )

        # Update filtering logic to include pagination slice
        old_filter = """const filteredTransactions = transactions.filter(txn =>
    txn.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );"""
        
        new_filter = """const filteredTransactions = transactions.filter(txn =>
    txn.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );"""
        content = content.replace(old_filter, new_filter)

        # Keep current page reset when searching
        content = content.replace(
            'onChange={(e) => setSearchTerm(e.target.value)}',
            'onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}'
        )

        # Replace mapping of transactions to paginated array
        content = content.replace(
            'filteredTransactions.map((txn, index) => (',
            'paginatedTransactions.map((txn, index) => ('
        )

        # Inject Pagination controls after the table div
        table_end = "</div>\n        </div>\n\n        {/* Right Panel - Category Editor */}"
        pagination_ui = """</div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-dark-100 bg-white">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 bg-dark-50 text-dark-600 rounded-lg hover:bg-dark-100 disabled:opacity-50 transition-colors"
                title="Previous Page"
              >
                Previous
              </button>
              <div className="flex gap-1">
                <span className="text-sm font-medium text-dark-500">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-4 py-2 bg-dark-50 text-dark-600 rounded-lg hover:bg-dark-100 disabled:opacity-50 transition-colors"
                title="Next Page"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Category Editor */}"""
        content = content.replace(table_end, pagination_ui)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Transactions pagination added.")

add_pagination_transactions()
