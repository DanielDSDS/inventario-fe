import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Alert
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const CompanyList = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [nit, setNit] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/companies/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener las empresas');
      }

      const data = await response.json();
      setCompanies(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener las empresas:', error);
      setIsLoading(false);
      showAlert('error', 'Error al obtener las empresas');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = editingCompany
        ? `http://localhost:3000/companies/${editingCompany}`
        : 'http://localhost:3000/companies/';
      const method = editingCompany ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ nit, name, address, phone }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la empresa');
      }

      fetchCompanies();
      setShowModal(false);
      setEditingCompany(null);
      setIsLoading(false);
      showAlert('success', 'La empresa se guardó correctamente');
    } catch (error) {
      console.error('Error al guardar la empresa:', error);
      setIsLoading(false);
      showAlert('error', 'Error al guardar la empresa');
    }
  };

  const editCompany = (company) => {
    setEditingCompany(company.id);
    setNit(company.nit);
    setName(company.name);
    setAddress(company.address);
    setPhone(company.phone);
    setShowModal(true);
  };

  const deleteCompany = async (companyId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la empresa');
      }

      fetchCompanies();
      setIsLoading(false);
      showAlert('success', 'La empresa se eliminó correctamente');
    } catch (error) {
      console.error('Error al eliminar la empresa:', error);
      setIsLoading(false);
      showAlert('error', 'Error al eliminar la empresa');
    }
  }
  const viewArticles = (companyId) => {
    navigate(`/articles/${companyId}`);
  };

  const closeModal = () => {
    setEditingCompany(null);
    setNit('');
    setName('');
    setAddress('');
    setPhone('');
    setShowModal(false);
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  return (
    <Container>
      <h2 className='mt-5 mb-4'>Company List</h2>
      {alert.show && (
        <div className={`alert alert-${alert.type}`} role="alert">
          {alert.message}
        </div>
      )}
      {auth.user.role === 'administrador' && (
        <Button className='mb-4' onClick={() => setShowModal(true)}>Add Company</Button>
      )}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>NIT</th>
            <th>Name</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td>{company.id}</td>
              <td>{company.nit}</td>
              <td>{company.name}</td>
              <td>{company.address}</td>
              <td>{company.phone}</td>
              {auth.user.role === 'administrador' && (
                <td className='text-center'>
                  <Button onClick={() => viewArticles(company.id)}>View</Button>{' '}
                  <Button onClick={() => editCompany(company)}>Edit</Button>{' '}
                  <Button onClick={() => deleteCompany(company.id)}>Delete</Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {isLoading && (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingCompany ? 'Edit Company' : 'Add Company'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="nit">
              <Form.Label>NIT</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter NIT"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Form.Group>

            <Form.Group className='mb-4' controlId="phone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Save
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CompanyList;
