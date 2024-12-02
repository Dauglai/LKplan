type RequestItemProps = {
    name: string;
    direction: string;
};

export default function RequestItem({ name, direction }: RequestItemProps): JSX.Element {
  return (
    <div className="RequestItem">
        <h3 className="RequestName">{name}</h3>
        <span className="RequestDirection">{direction}</span>
    </div>
  )
};

