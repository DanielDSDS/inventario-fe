import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import CompanyList from './components/CompanyList';
import ArticleList from './components/ArticleList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/companies" element={<CompanyList />} />
        <Route path="/articles/:companyId" element={<ArticleList />} />
      </Routes>
    </Router>
  );
}

export default App;
