import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Database,
  Globe,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mcpClient } from '@/services/mcpClient';

interface MCPStatusProps {
  className?: string;
}

export const MCPStatus: React.FC<MCPStatusProps> = ({ className }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkMCPStatus = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const healthy = await mcpClient.healthCheck();
      setIsConnected(healthy);
      setLastChecked(new Date());
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkMCPStatus();
  }, []);

  const getStatusColor = (): string => {
    if (isConnected === null) return 'text-muted-foreground';
    return isConnected ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (): React.ReactElement => {
    if (isLoading) {
      return <Loader2 className='h-4 w-4 animate-spin' />;
    }

    if (isConnected === null) {
      return <AlertCircle className='h-4 w-4' />;
    }

    return isConnected ? (
      <CheckCircle className='h-4 w-4 text-green-600' />
    ) : (
      <XCircle className='h-4 w-4 text-red-600' />
    );
  };

  const getStatusText = (): string => {
    if (isLoading) return 'Checking...';
    if (isConnected === null) return 'Unknown';
    return isConnected ? 'Connected' : 'Disconnected';
  };

  return (
    <Card className={className}>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center text-sm font-medium'>
          <Database className='mr-2 h-4 w-4' />
          MCP Documentation Server
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='space-y-3'>
          {/* Status Row */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              {getStatusIcon()}
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={checkMCPStatus}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>

          {/* Last Checked */}
          {lastChecked && (
            <p className='text-xs text-muted-foreground'>
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}

          {/* Error Message */}
          {error && (
            <div className='p-2 bg-destructive/10 border border-destructive/20 rounded-md'>
              <p className='text-xs text-destructive'>{error}</p>
            </div>
          )}

          {/* Benefits Description */}
          <div className='space-y-2 pt-2 border-t'>
            <div className='flex items-center text-xs text-muted-foreground'>
              <Globe className='mr-1 h-3 w-3' />
              <span>Up-to-date library docs</span>
            </div>
            <div className='flex items-center text-xs text-muted-foreground'>
              <BookOpen className='mr-1 h-3 w-3' />
              <span>Version-specific guidance</span>
            </div>
            {isConnected && (
              <div className='p-2 bg-primary/10 border border-primary/20 rounded-md'>
                <p className='text-xs text-primary font-medium'>
                  ✨ Enhanced documentation generation enabled
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Your documents will include current library-specific guidance
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
