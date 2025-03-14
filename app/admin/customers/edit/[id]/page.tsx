import React from 'react';
import { EditCustomerForm } from '@/components/admin/customers/edit-customer-form';

interface Props {
  params: { id: string }
}

const AdminEditCustomerPage = ({ params }: Props) => {
  const { id } = params;

  return (
    <div>
      <EditCustomerForm id={id} />
    </div>
  );
};

export default AdminEditCustomerPage;
