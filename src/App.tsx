import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"

import { Dashboard } from "@/features/dashboard/Dashboard"
import { StudentList } from "@/features/students/StudentList"
import { StudentRegistration } from "@/features/students/StudentRegistration"
import { StudentDetail } from "@/features/students/StudentDetail"

// Placeholders for now
const Planning = () => <div><h2 className="text-2xl font-bold">一括計画</h2><p className="mt-4 text-muted-foreground">複数の生徒の計画を俯瞰して調整できます。</p></div>
const Reports = () => <div><h2 className="text-2xl font-bold">レポート</h2><p className="mt-4 text-muted-foreground">進捗状況のグラフや保護者向けレポートを作成します。</p></div>
const Settings = () => <div><h2 className="text-2xl font-bold">設定</h2><p className="mt-4 text-muted-foreground">アプリの設定やデータのインポート/エクスポートを行います。</p></div>

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/students" element={<StudentList />} />
                    <Route path="/students/new" element={<StudentRegistration />} />
                    <Route path="/students/:studentId" element={<StudentDetail />} />
                    <Route path="/planning" element={<Planning />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </Layout>
        </Router>
    )
}

export default App
